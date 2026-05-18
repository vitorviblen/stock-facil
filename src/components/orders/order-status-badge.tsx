import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types/database";

const labels: Record<OrderStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  shipped: "Em rota",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="border-amber-500 text-amber-700">{labels[status]}</Badge>;
    case "approved":
      return <Badge variant="outline" className="border-blue-500 text-blue-700">{labels[status]}</Badge>;
    case "shipped":
      return <Badge variant="mint">{labels[status]}</Badge>;
    case "delivered":
      return <Badge variant="success">{labels[status]}</Badge>;
    case "cancelled":
      return <Badge variant="destructive">{labels[status]}</Badge>;
  }
}
