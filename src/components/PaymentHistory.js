import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import formatters from '../utils/formatters';

const PaymentHistory = ({ loan }) => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Historial de Pagos - {loan.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {loan.paymentHistory.map((payment, index) => (
            <div key={index} className="flex justify-between items-center p-2 border-b last:border-0">
              <div>
                <div className="font-medium">{formatters.date(payment.date)}</div>
                <div className="text-sm text-gray-600">{formatters.currency(payment.amount)}</div>
              </div>
              <Badge variant={payment.status === 'paid' ? 'success' : 'warning'}>
                {payment.status === 'paid' ? 'Pagado' : 'Pendiente'}
              </Badge>
            </div>
          ))}
        </div>
        {loan.nextPaymentDate && (
          <div className="mt-4 text-sm text-gray-600">
            Próximo vencimiento: {formatters.date(loan.nextPaymentDate)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
