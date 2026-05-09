import React from 'react';
import { Sale, AppState, Customer } from '../types';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';

interface ReceiptProps {
  sale: Sale;
  state: AppState;
}

export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(({ sale, state }, ref) => {
  const customer = sale.customerId ? state.customers.find(c => c.id === sale.customerId) : null;
  const cashier = state.users.find(u => u.id === sale.cashierId);

  return (
    <div ref={ref} className="p-8 bg-white text-black font-mono text-sm max-w-[400px] mx-auto">
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-xl font-bold uppercase tracking-widest">StockFlow POS</h1>
        <p className="text-xs">123 Commerce Avenue, Tech City</p>
        <p className="text-xs">Tel: +1 (555) 0123-4567</p>
      </div>

      <div className="border-t border-b border-black py-2 mb-4 space-y-1">
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{format(new Date(sale.timestamp), 'MMM dd, yyyy HH:mm')}</span>
        </div>
        <div className="flex justify-between">
          <span>Receipt #:</span>
          <span>{sale.id.split('-')[1]}</span>
        </div>
        <div className="flex justify-between">
          <span>Cashier:</span>
          <span>{cashier?.name || 'Staff'}</span>
        </div>
        {customer && (
          <div className="flex justify-between">
            <span>Customer:</span>
            <span>{customer.name}</span>
          </div>
        )}
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex justify-between font-bold border-b border-gray-100 pb-1">
          <span className="flex-[2]">Item</span>
          <span className="flex-1 text-center">Qty</span>
          <span className="flex-1 text-right">Price</span>
        </div>
        {sale.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-xs">
            <span className="flex-[2] truncate">{item.name}</span>
            <span className="flex-1 text-center">{item.quantity}</span>
            <span className="flex-1 text-right">{formatCurrency(item.priceAtSale * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-black pt-2 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(sale.subtotal)}</span>
        </div>
        {sale.discountAmount && sale.discountAmount > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Discount ({sale.discountCode}):</span>
            <span>-{formatCurrency(sale.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold">
          <span>TOTAL:</span>
          <span>{formatCurrency(sale.total)}</span>
        </div>
        <div className="flex justify-between pt-2">
          <span>Paid via:</span>
          <span className="uppercase">{sale.paymentMethod}</span>
        </div>
      </div>

      <div className="text-center mt-8 space-y-1">
        <p className="text-xs">Thank you for your business!</p>
        <p className="text-[10px] text-gray-400">Please keep this receipt for returns or exchanges.</p>
        <div className="pt-4 flex justify-center">
          {/* Mock barcode */}
          <div className="h-8 w-48 bg-black flex items-center justify-center text-white text-[8px] tracking-[6px]">
            {sale.id.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';
