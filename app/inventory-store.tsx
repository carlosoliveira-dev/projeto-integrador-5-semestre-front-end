"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";

export type Supplier = {
  id: string;
  companyName: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  contact: string;
};

export type Product = {
  id: string;
  name: string;
  barcode: string;
  description: string;
  quantity: number;
  category: string;
  expirationDate: string;
  image: string;
  supplierIds: string[];
};

type AuthenticatedUser = {
  id: number;
  name: string;
  email: string;
};

type InventoryState = {
  suppliers: Supplier[];
  products: Product[];
  user: AuthenticatedUser | null;
  ready: boolean;
  storageError: string;
};

type ApiProduct = {
  id: number;
  name: string;
  description: string;
  barCode: string;
  stockQuantity: string | number;
  category: string;
  expirationDate?: string | null;
  image?: string | null;
};

type ApiSupplier = {
  id: number;
  companyName: string;
  cnpj: string;
  primaryContactName: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
};

type ApiProductSupplier = {
  productId: number;
  supplierId: number;
};

type AuthResponse = {
  token: string;
  user: {
    id?: number;
    user_id?: number;
    name: string;
    email: string;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
const TOKEN_KEY = "estoque-facil-token";
const USER_KEY = "estoque-facil-user";
const INITIAL_STATE: InventoryState = {
  suppliers: [],
  products: [],
  user: null,
  ready: false,
  storageError: "",
};
let state = INITIAL_STATE;
let initialized = false;
let loadingRequest: Promise<void> | null = null;
let token: string | null = null;
const listeners = new Set<() => void>();

class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

function updateState(update: Partial<InventoryState>) {
  state = { ...state, ...update };
  notify();
}

function apiUrl(path: string) {
  if (!API_URL) {
    throw new ApiError(
      "A URL da API não foi configurada. Defina NEXT_PUBLIC_API_URL e reinicie o servidor.",
    );
  }
  return `${API_URL}${path}`;
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; authenticated?: boolean } = {},
): Promise<T> {
  const url = apiUrl(path);
  const headers = new Headers();
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (options.authenticated && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      ...(options.body === undefined
        ? {}
        : { body: JSON.stringify(options.body) }),
    });
  } catch (error) {
    console.error(`Falha de conexão ao chamar a API (${path}).`, error);
    throw new ApiError(
      "Não foi possível conectar à API. Verifique se ela está ativa e se permite requisições do endereço do front-end (CORS).",
    );
  }

  const responseText = await response.text();
  let payload: unknown;
  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      if (!response.ok) {
        throw new ApiError(`A API retornou o erro HTTP ${response.status}.`);
      }
      throw new ApiError("A API retornou uma resposta que não é JSON válido.");
    }
  }

  if (!response.ok) {
    const errorData =
      payload && typeof payload === "object"
        ? (payload as { error?: unknown; details?: unknown })
        : undefined;
    const message =
      typeof errorData?.error === "string"
        ? errorData.details
          ? `${errorData.error} ${String(errorData.details)}`
          : errorData.error
        : `A API retornou o erro HTTP ${response.status}.`;
    if (response.status === 401 || response.status === 403) {
      throw new ApiError(`${message} Entre novamente na sua conta.`);
    }
    throw new ApiError(message);
  }

  return payload as T;
}

function mapSupplier(supplier: ApiSupplier): Supplier {
  return {
    id: String(supplier.id),
    companyName: supplier.companyName,
    cnpj: supplier.cnpj,
    address: supplier.address ?? "",
    phone: supplier.phone ?? "",
    email: supplier.email ?? "",
    contact: supplier.primaryContactName,
  };
}

function mapProduct(product: ApiProduct, supplierIds: string[] = []): Product {
  return {
    id: String(product.id),
    name: product.name,
    barcode: product.barCode ?? "",
    description: product.description,
    quantity: Number(product.stockQuantity) || 0,
    category: product.category ?? "",
    expirationDate: product.expirationDate ?? "",
    image: product.image ?? "",
    supplierIds,
  };
}

async function fetchInventory() {
  if (!state.user || !token) {
    updateState({
      suppliers: [],
      products: [],
      ready: true,
      storageError: "",
    });
    return;
  }

  updateState({ ready: false, storageError: "" });
  try {
    const [apiProducts, apiSuppliers] = await Promise.all([
      request<ApiProduct[]>("/products", { authenticated: true }),
      request<ApiSupplier[]>("/suppliers"),
    ]);
    if (!Array.isArray(apiProducts) || !Array.isArray(apiSuppliers)) {
      throw new ApiError("A API retornou um formato inválido para produtos ou fornecedores.");
    }

    const productsWithSuppliers = await Promise.all(
      apiProducts.map(async (product) => {
        const associations = await request<ApiProductSupplier[]>(
          `/products/${product.id}/suppliers`,
          { authenticated: true },
        );
        if (!Array.isArray(associations)) {
          throw new ApiError("A API retornou um formato inválido para os vínculos.");
        }
        return mapProduct(
          product,
          associations.map((association) => String(association.supplierId)),
        );
      }),
    );

    updateState({
      products: productsWithSuppliers,
      suppliers: apiSuppliers.map(mapSupplier),
      ready: true,
      storageError: "",
    });
  } catch (error) {
    console.error("Não foi possível carregar produtos e fornecedores.", error);
    updateState({
      ready: true,
      storageError:
        error instanceof Error ? error.message : "Não foi possível carregar os dados da API.",
    });
  }
}

function getSnapshot(): InventoryState {
  return state;
}

function getServerSnapshot() {
  return INITIAL_STATE;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function persistSession(auth: AuthResponse, fallbackUserId?: number) {
  const userId = auth.user.id ?? auth.user.user_id ?? fallbackUserId;
  if (!auth.token || !userId || !Number.isInteger(userId)) {
    throw new ApiError("A API não retornou um token e um ID de usuário válidos.");
  }

  const user = { id: userId, name: auth.user.name, email: auth.user.email };
  try {
    sessionStorage.setItem(TOKEN_KEY, auth.token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    throw new ApiError("Não foi possível salvar a sessão neste navegador.");
  }
  token = auth.token;
  updateState({ user, storageError: "" });
}

function isAuthenticatedUser(value: unknown): value is AuthenticatedUser {
  if (!value || typeof value !== "object") return false;
  const user = value as Record<string, unknown>;
  return (
    typeof user.id === "number" &&
    typeof user.name === "string" &&
    typeof user.email === "string"
  );
}

async function initialize() {
  if (initialized) return loadingRequest;
  initialized = true;
  if (typeof window === "undefined") return;

  try {
    token = sessionStorage.getItem(TOKEN_KEY);
    const savedUser = sessionStorage.getItem(USER_KEY);
    if (token && savedUser) {
      const user: unknown = JSON.parse(savedUser);
      if (!isAuthenticatedUser(user)) {
        throw new ApiError("A sessão salva está inválida. Entre novamente.");
      }
      updateState({ user });
      loadingRequest = fetchInventory();
      await loadingRequest;
      return;
    }
    token = null;
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    updateState({ ready: true });
  } catch (error) {
    console.error("Não foi possível restaurar a sessão.", error);
    token = null;
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    updateState({
      user: null,
      ready: true,
      storageError:
        error instanceof Error ? error.message : "Não foi possível restaurar a sessão.",
    });
  }
}

async function authenticate(path: "/users/login" | "/users/signup", body: object) {
  const auth = await request<AuthResponse>(path, { method: "POST", body });
  persistSession(auth);
  loadingRequest = fetchInventory();
  await loadingRequest;
}

type InventoryActions = {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  addSupplier: (supplier: Omit<Supplier, "id">) => Promise<Supplier>;
  updateSupplier: (
    supplierId: string,
    supplier: Omit<Supplier, "id">,
  ) => Promise<Supplier>;
  addProduct: (
    product: Omit<Product, "id" | "supplierIds">,
  ) => Promise<Product>;
  updateProduct: (
    productId: string,
    product: Omit<Product, "id" | "supplierIds">,
  ) => Promise<Product>;
  associateSupplier: (
    productId: string,
    supplierId: string,
  ) => Promise<"associated" | "already-associated">;
  disassociateSupplier: (productId: string, supplierId: string) => Promise<void>;
};

const actions: InventoryActions = {
  async signIn(email, password) {
    await authenticate("/users/login", { email, password });
  },
  async signUp(name, email, password) {
    await authenticate("/users/signup", { name, email, password });
  },
  signOut() {
    token = null;
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    updateState({
      suppliers: [],
      products: [],
      user: null,
      ready: true,
      storageError: "",
    });
  },
  async addSupplier(supplier) {
    if (!state.user) throw new ApiError("Entre na sua conta para cadastrar fornecedores.");
    const created = await request<ApiSupplier>(`/suppliers/${state.user.id}`, {
      method: "POST",
      body: {
        companyName: supplier.companyName,
        cnpj: supplier.cnpj,
        primaryContactName: supplier.contact,
        address: supplier.address,
        phone: supplier.phone,
        email: supplier.email,
      },
    });
    const mapped = mapSupplier(created);
    updateState({ suppliers: [...state.suppliers, mapped] });
    return mapped;
  },
  async updateSupplier(supplierId, supplier) {
    const response = await request<{ supplier: ApiSupplier }>(
      `/suppliers/${encodeURIComponent(supplierId)}`,
      {
        method: "PUT",
        body: {
          companyName: supplier.companyName,
          cnpj: supplier.cnpj,
          primaryContactName: supplier.contact,
          address: supplier.address,
          phone: supplier.phone,
          email: supplier.email,
        },
      },
    );
    if (!response?.supplier) {
      throw new ApiError("A API não retornou os dados do fornecedor atualizado.");
    }
    const mapped = mapSupplier(response.supplier);
    updateState({
      suppliers: state.suppliers.map((item) =>
        item.id === supplierId ? mapped : item,
      ),
    });
    return mapped;
  },
  async addProduct(product) {
    if (!state.user) throw new ApiError("Entre na sua conta para cadastrar produtos.");
    const created = await request<ApiProduct>(`/products/${state.user.id}`, {
      method: "POST",
      authenticated: true,
      body: {
        name: product.name,
        description: product.description,
        barCode: product.barcode,
        stockQuantity: String(product.quantity),
        category: product.category,
        ...(product.expirationDate
          ? { expirationDate: product.expirationDate }
          : {}),
        ...(product.image ? { image: product.image } : {}),
      },
    });
    const mapped = mapProduct(created);
    updateState({ products: [...state.products, mapped] });
    return mapped;
  },
  async updateProduct(productId, product) {
    if (!state.user) throw new ApiError("Entre na sua conta para editar produtos.");
    const response = await request<{ product: ApiProduct }>(
      `/products/${encodeURIComponent(productId)}`,
      {
        method: "PUT",
        authenticated: true,
        body: {
          userId: state.user.id,
          name: product.name,
          description: product.description,
          barCode: product.barcode,
          stockQuantity: String(product.quantity),
          category: product.category,
          expirationDate: product.expirationDate,
          image: product.image,
        },
      },
    );
    if (!response?.product) {
      throw new ApiError("A API não retornou os dados do produto atualizado.");
    }
    const current = state.products.find((item) => item.id === productId);
    const mapped = mapProduct(response.product, current?.supplierIds ?? []);
    updateState({
      products: state.products.map((item) =>
        item.id === productId ? mapped : item,
      ),
    });
    return mapped;
  },
  async associateSupplier(productId, supplierId) {
    const product = state.products.find((item) => item.id === productId);
    if (!product || product.supplierIds.includes(supplierId)) {
      return "already-associated";
    }
    await request(
      `/products/${encodeURIComponent(productId)}/suppliers/${encodeURIComponent(supplierId)}`,
      { method: "POST", authenticated: true },
    );
    updateState({
      products: state.products.map((item) =>
        item.id === productId
          ? { ...item, supplierIds: [...item.supplierIds, supplierId] }
          : item,
      ),
    });
    return "associated";
  },
  async disassociateSupplier(productId, supplierId) {
    await request(
      `/products/${encodeURIComponent(productId)}/suppliers/${encodeURIComponent(supplierId)}`,
      { method: "DELETE", authenticated: true },
    );
    updateState({
      products: state.products.map((item) =>
        item.id === productId
          ? {
              ...item,
              supplierIds: item.supplierIds.filter((id) => id !== supplierId),
            }
          : item,
      ),
    });
  },
};

export function InventoryProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void initialize();
  }, []);

  return children;
}

export function useInventory() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return { ...snapshot, ...actions };
}
