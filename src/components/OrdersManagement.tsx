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
    size?: string;
    color?: string;
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

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <div className="text-center py-12">Loading orders...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Orders Management</h2>
        <div className="text-sm text-slate-600">Total Orders: {orders.length}</div>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="w-4 h-4 text-slate-400 mr-2" />
                      <span className="text-sm font-medium text-slate-900">
                        {order._id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-slate-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-slate-900">{order.user?.name}</div>
                        <div className="text-xs text-slate-500">{order.user?.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                      {formatDate(order.createdAt)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-semibold text-slate-900">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      {order.totalAmount.toFixed(2)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-slate-900 hover:text-slate-700 font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* ---------- MODAL: ORDER DETAILS ---------- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* HEADER */}
            <div className="p-6 border-b border-slate-200 flex justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Order Details</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Order ID: {selectedOrder._id.slice(-8).toUpperCase()}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* CUSTOMER INFO */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Customer Information</h4>
                <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
                  <p><b>Name:</b> {selectedOrder.user?.name}</p>
                  <p><b>Email:</b> {selectedOrder.user?.email}</p>
                </div>
              </div>

              {/* SHIPPING ADDRESS - FIXED */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Shipping Address</h4>

                <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700">

                  <p><b>{selectedOrder.shippingAddress?.fullName}</b></p>

                  <p>{selectedOrder.shippingAddress?.addressLine1}</p>

                  {selectedOrder.shippingAddress?.addressLine2 && (
                    <p>{selectedOrder.shippingAddress.addressLine2}</p>
                  )}

                  <p>
                    {selectedOrder.shippingAddress?.city},{" "}
                    {selectedOrder.shippingAddress?.state} -{" "}
                    {selectedOrder.shippingAddress?.pincode}
                  </p>

                  <p>Phone: {selectedOrder.shippingAddress?.phone}</p>

                  {selectedOrder.shippingAddress?.landmark && (
                    <p>Landmark: {selectedOrder.shippingAddress.landmark}</p>
                  )}

                </div>
              </div>

              {/* ORDER ITEMS */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.products.map((item, index) => (
                    <div key={index} className="flex gap-4 bg-slate-50 p-4 rounded-lg">
                      <div className="w-20 h-20 bg-slate-200 rounded-lg flex-shrink-0">
                        {item.product?.images?.[0]?.url ? (
                          <img
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h5 className="font-medium text-slate-900">{item.product.name}</h5>

                        <div className="text-sm text-slate-600 mt-1">
                          Qty: {item.quantity}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-600">₹{item.product.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOTAL */}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-slate-900">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                </div>

                {selectedOrder.paymentId && (
                  <p className="text-sm text-slate-600 mt-2">
                    Payment ID: {selectedOrder.paymentId}
                  </p>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
