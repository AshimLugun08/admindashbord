import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Package, User, Calendar, DollarSign, X } from 'lucide-react';

interface Order {
  _id: string;
  user: { name: string; email: string };
  products: Array<{
    product: {
      name: string;
      images: Array<{ url: string }>;
      price: number;
    };
    quantity: number;
  }>;
  totalAmount: number;
  status: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    pincode: string;
    state: string;
    city: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
  };
  createdAt: string;
  paymentId?: string;
}

export default function OrdersManagement() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [token]);

  // -------------------------------------------------------
  // ✅ Fetch Orders (Admin)
  // -------------------------------------------------------
  const fetchOrders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // ✅ Update Status (Admin)
  // -------------------------------------------------------
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update in UI immediately
        setOrders(prev =>
          prev.map(o => (o._id === orderId ? data.order : o))
        );
        setSelectedOrder(data.order);
        alert("Order status updated!");
      }
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  // Helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return "bg-yellow-100 text-yellow-800";
      case 'shipped': return "bg-purple-100 text-purple-800";
      case 'delivered': return "bg-green-100 text-green-800";
      case 'cancelled': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("en-US", { hour12: true });

  if (loading) return <div className="text-center py-12">Loading orders...</div>;

  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Orders Management</h2>
        <p className="text-sm text-slate-600">Total Orders: {orders.length}</p>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Date</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>

          <tbody>
            {orders.map(order => (
              <tr key={order._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{order._id.slice(-8).toUpperCase()}</td>

                <td className="p-3">
                  {order.user?.name}
                  <br />
                  <span className="text-xs text-gray-500">
                    {order.user?.email}
                  </span>
                </td>

                <td className="p-3">{formatDate(order.createdAt)}</td>
                <td className="p-3 font-semibold">₹{order.totalAmount}</td>

                <td className="p-3">
                  <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>

                <td className="p-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-blue-600 underline"
                  >
                    View
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* -------------------------------------------------------
           MODAL
      ------------------------------------------------------- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto shadow-lg">

            {/* Modal Header */}
            <div className="flex justify-between p-5 border-b">
              <h3 className="text-xl font-bold">Order Details</h3>
              <button onClick={() => setSelectedOrder(null)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 space-y-6">

              {/* Shipping Address */}
              <div>
                <h4 className="font-semibold">Shipping Address</h4>
                <div className="bg-gray-50 p-4 rounded text-sm">
                  <p><b>{selectedOrder.shippingAddress.fullName}</b></p>
                  <p>{selectedOrder.shippingAddress.addressLine1}</p>
                  <p>
                    {selectedOrder.shippingAddress.city},{" "}
                    {selectedOrder.shippingAddress.state} -{" "}
                    {selectedOrder.shippingAddress.pincode}
                  </p>
                  <p>Phone: {selectedOrder.shippingAddress.phone}</p>
                </div>
              </div>

              {/* Products */}
              <div>
                <h4 className="font-semibold">Products</h4>
                {selectedOrder.products.map((item, i) => (
                  <div key={i} className="flex gap-4 bg-gray-50 p-4 rounded">
                    <img
                      src={
                        item.product?.images?.[0]?.url ||
                        "/placeholder.jpg"
                      }
                      className="w-20 h-20 rounded object-cover"
                    />

                    <div>
                      <p className="font-bold">{item.product.name}</p>
                      <p className="text-sm">Qty: {item.quantity}</p>
                      <p className="text-sm">₹{item.product.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Update */}
              <div>
                <h4 className="font-semibold">Update Status</h4>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    updateOrderStatus(selectedOrder._id, e.target.value)
                  }
                  className="border p-2 rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Total */}
              <p className="text-lg font-bold">
                Total: ₹{selectedOrder.totalAmount}
              </p>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
