const API_BASE_URL = "https://amber-hotels-qr-menu.onrender.com";

export interface MenuItem {
  _id?: string;
  name: string;
  price: number;
  category: string;
  image_url?: string;
}

export interface OrderItem {
  item_id: string;
  quantity: number;
}

export interface Order {
  _id?: string;
  table_number: number;
  items: OrderItem[];
  notes?: string;
  status: "pending" | "preparing" | "served";
  created_at?: string;
}

export interface Table {
  _id?: string;
  table_number: number;
  qr_code?: string;
  qr_image_url?: string;
  created_at?: string;
}

export interface Admin {
  username: string;
  email: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("admin_token");
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_token", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: "cors",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      }
      return response.text();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to the server. Please check your internet connection."
        );
      }
      throw error;
    }
  }

  // Auth
  async login(username: string, password: string) {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const response = await this.request("/token", {
      method: "POST",
      body: formData,
    });

    this.setToken(response.access_token);
    return response;
  }

  async register(username: string, email: string, password: string) {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);

    return this.request("/register", {
      method: "POST",
      body: formData,
    });
  }

  // Menu
  async getMenu(): Promise<MenuItem[]> {
    return this.request("/menu");
  }

  async createMenuItem(
    name: string,
    price: number,
    category: string,
    file: File
  ): Promise<MenuItem> {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price.toString());
    formData.append("category", category);
    formData.append("file", file);

    return this.request("/menu", {
      method: "POST",
      body: formData,
    });
  }

  async updateMenuItem(
    id: string,
    data: Partial<MenuItem>,
    file?: File
  ): Promise<MenuItem> {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.price !== undefined)
      formData.append("price", data.price.toString());
    if (data.category) formData.append("category", data.category);
    if (file) formData.append("file", file);

    return this.request(`/menu/${id}`, {
      method: "PATCH",
      body: formData,
    });
  }

  async deleteMenuItem(id: string) {
    return this.request(`/menu/${id}`, {
      method: "DELETE",
    });
  }

  // Tables
  async getTables(): Promise<Table[]> {
    return this.request("/tables");
  }

  async createTable(tableNumber: number): Promise<Table> {
    const formData = new FormData();
    formData.append("table_number", tableNumber.toString());

    return this.request("/table", {
      method: "POST",
      body: formData,
    });
  }

  async deleteTable(tableNumber: number) {
    return this.request(`/table/${tableNumber}`, {
      method: "DELETE",
    });
  }

  async getQRImage(tableNumber: number) {
    return this.request(`/qr-image/${tableNumber}`);
  }

  // Orders
  async createOrder(order: Omit<Order, "_id" | "created_at">): Promise<Order> {
    return this.request("/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });
  }

  async getOrders(): Promise<Order[]> {
    return this.request("/orders");
  }

  async getTableOrders(tableNumber: number): Promise<Order[]> {
    return this.request(`/orders/${tableNumber}`);
  }

  async updateOrderStatus(id: string, status: string) {
    const formData = new FormData();
    formData.append("status", status);

    return this.request(`/order/${id}/status`, {
      method: "PATCH",
      body: formData,
    });
  }
}

export const apiClient = new ApiClient();
