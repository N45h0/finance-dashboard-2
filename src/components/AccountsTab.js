import React from 'react';
import { 
  Card, 
  CardContent, 
  Grid, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  Alert,
  Box
} from '@mui/material';
import { CreditCard } from 'lucide-react';
import formatters from '../utils/formatters';
import accounts from '../data/accounts';

const AccountsTab = () => {
  return (
    <Grid container spacing={3}>
      {accounts.map((account) => (
        <Grid item xs={12} md={4} key={account.id}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {account.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CreditCard size={20} className="mr-2" />
                <Typography>{account.type}</Typography>
              </Box>
              {account.income && (
                <List>
                  {account.income.map((income, idx) => (
                    <ListItem key={idx}>
                      <ListItemText 
                        primary={income.source}
                        secondary={formatters.currency(income.estimatedAmount)} 
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default AccountsTab;