export interface CartResponse {
  id: number;
  id_producto: number;
  cantidad: number;
  nombre: string;
  precio: string;
}

export interface CartData {
  id_producto: number;
  cantidad: number;
}
