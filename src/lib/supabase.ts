import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useStore } from "@/store/useStore";

/* ------------------------------------------------------------------ */
/*  Inicialização                                                      */
/* ------------------------------------------------------------------ */
let supabaseClient: SupabaseClient | null = null;

export function initSupabase(url?: string, anonKey?: string) {
  const URL = url ?? import.meta.env.VITE_SUPABASE_URL;
  const KEY = anonKey ?? import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!URL || !KEY) throw new Error("Faltam VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY");
  supabaseClient = createClient(URL, KEY, { auth: { persistSession: false } });
  return supabaseClient;
}

export function getSupabaseClient() {
  if (!supabaseClient) throw new Error("Supabase não foi inicializado");
  return supabaseClient;
}

export async function testConnection() {
  try {
    const { error } = await getSupabaseClient()
      .from("obras")
      .select("*", { count: "exact", head: true });
    return !error;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function chunk<T>(arr: T[], size = 500) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function upsert(table: string, rows: any[]) {
  if (!rows.length) return;
  const supabase = getSupabaseClient();
  for (const part of chunk(rows, 500)) {
    const { error } = await supabase.from(table).upsert(part, { onConflict: "id" });
    if (error) throw new Error(`${table}: ${error.message}`);
  }
}

function flattenTalaoItems(taloes: any[]) {
  return taloes.flatMap((t: any) =>
    (t.itens ?? []).map((it: any) => ({
      ...it,
      talao_id: t.id,
      id: it.id,
      preco_unitario: it.precoUnit,
      descricao_livre: it.descricaoLivre,
    }))
  );
}

function flattenCompraItems(compras: any[]) {
  return compras.flatMap((c: any) =>
    (c.itens ?? []).map((it: any) => ({
      ...it,
      compra_id: c.id,
      id: it.id,
      descricao_livre: it.descricaoLivre,
      custo_unit: it.custoUnit,
      preco_unit_obra: it.precoUnitObra,
      markup_aplicado: it.markupAplicado,
    }))
  );
}

/* ------------------------------------------------------------------ */
/*  PUSH (local -> Supabase)                                          */
/* ------------------------------------------------------------------ */
export async function syncToSupabase() {
  const store = useStore.getState();

  // pais
  await upsert("obras", store.obras.map((o: any) => ({
    id: o.id, nome: o.nome, cidade: o.cidade, ativo: o.ativo, criado_em: o.criadoEm
  })));
  await upsert("produtos", store.produtos);
  await upsert("fornecedores", store.fornecedores);
  await upsert("taloes", store.taloes.map(({ itens, ...t }: any) => ({ ...t, assinatura: t.assinatura ?? null })));
  await upsert("compras_externas", store.compras.map(({ itens, ...c }: any) => ({ ...c, anexos: c.anexos ?? null })));
  await upsert("devolucoes", store.devolucoes);
  await upsert("regras_markup", store.regrasMarkup ?? []);

  // filhos
  await upsert("itens_talao", flattenTalaoItems(store.taloes));
  await upsert("itens_compra_externa", flattenCompraItems(store.compras));

  // timestamp
  useStore.setState((s: any) => ({
    config: {
      ...s.config,
      supabase: { ...(s.config?.supabase ?? {}), lastSync: new Date().toISOString() },
    },
  }));

  return { ok: true };
}

/* ------------------------------------------------------------------ */
/*  PULL (Supabase -> local)                                          */
/* ------------------------------------------------------------------ */
export async function syncFromSupabase() {
  const supabase = getSupabaseClient();

  const [
    obrasRes,
    produtosRes,
    fornecedoresRes,
    taloesRes,
    itensTalaoRes,
    comprasRes,
    itensCompraRes,
    devolucoesRes,
  ] = await Promise.all([
    supabase.from("obras").select("*"),
    supabase.from("produtos").select("*"),
    supabase.from("fornecedores").select("*"),
    supabase.from("taloes").select("*"),
    supabase.from("itens_talao").select("*"),
    supabase.from("compras_externas").select("*"),
    supabase.from("itens_compra_externa").select("*"),
    supabase.from("devolucoes").select("*"),
  ]);

  const obras = obrasRes.data?.map((o: any) => ({
    id: o.id, nome: o.nome, cidade: o.cidade, ativo: o.ativo, criadoEm: o.criado_em,
  })) ?? [];

  const produtos = produtosRes.data ?? [];
  const fornecedores = fornecedoresRes.data ?? [];

  const taloes = (taloesRes.data ?? []).map((t: any) => {
    const itens = (itensTalaoRes.data ?? [])
      .filter((i: any) => i.talao_id === t.id)
      .map((i: any) => ({
        id: i.id,
        produtoId: i.produto_id,
        descricaoLivre: i.descricao_livre,
        qtd: i.qtd,
        unidade: i.unidade,
        origem: i.origem,
        precoUnit: i.preco_unitario,
        qtdEntregue: i.qtd_entregue,
        qtdDevolvida: i.qtd_devolvida,
        vinculosCompra: i.vinculos_compra ?? undefined,
      }));
    return {
      id: t.id,
      numero: t.numero,
      obraId: t.obra_id,
      solicitante: t.solicitante,
      status: t.status,
      itens,
      assinatura: t.assinatura ?? undefined,
      criadoEm: t.criado_em,
    };
  });

  const compras = (comprasRes.data ?? []).map((c: any) => {
    const itens = (itensCompraRes.data ?? [])
      .filter((i: any) => i.compra_id === c.id)
      .map((i: any) => ({
        id: i.id,
        produtoId: i.produto_id,
        descricaoLivre: i.descricao_livre,
        qtd: i.qtd,
        unidade: i.unidade,
        custoUnit: i.custo_unit,
        markupAplicado: i.markup_aplicado,
        precoUnitObra: i.preco_unit_obra,
      }));
    return {
      id: c.id,
      fornecedorId: c.fornecedor_id,
      numeroNota: c.numero_nota,
      data: c.data,
      anexos: c.anexos ?? undefined,
      itens,
    };
  });

  const devolucoes = devolucoesRes.data ?? [];

  // grava TUDO no Zustand
  useStore.setState((s: any) => ({
    obras,
    produtos,
    fornecedores,
    taloes,
    compras,
    devolucoes,
    config: {
      ...s.config,
      supabase: { ...(s.config?.supabase ?? {}), lastSync: new Date().toISOString() },
    },
  }));

  return { obras: obras.length, produtos: produtos.length, fornecedores: fornecedores.length, taloes: taloes.length, compras: compras.length, devolucoes: devolucoes.length };
}

/* ------------------------------------------------------------------ */
/*  Observação sobre criação de tabelas                               */
/* ------------------------------------------------------------------ */
// Não é seguro/viável criar tabelas a partir do front com a chave "anon".
// Remova createSupabaseTables() do cliente.
// Crie as tabelas 1x no painel SQL do Supabase (ou automatize via:
//  a) Supabase CLI migrations, ou
//  b) backend Tauri (Rust) usando service_role de forma segura).
