import React from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography 
} from '@mui/material';
import { CreditCard } from 'lucide-react';
import accounts from '../data/accounts';

const AccountsTab = () => {
  return (
    <Grid container spacing={2}>
      {accounts.map((account) => (
        <Grid item xs={12} md={6} key={account.id}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {account.name}
              </Typography>
              <Typography>
                <CreditCard size={16} style={{ marginRight: 8 }} />
                {account.type}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default AccountsTab;
