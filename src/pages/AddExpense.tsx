import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '@/contexts/ExpenseContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { PlusCircle, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import VendorCombobox from '@/components/VendorCombobox';
import ProductCombobox from '@/components/ProductCombobox';

const AddExpense = () => {
  const navigate = useNavigate();
  const { addExpense } = useExpenses();

  const getDefaultDate = () => format(new Date(), 'yyyy-MM-dd');

  const [formData, setFormData] = useState({
    date: getDefaultDate(),
    vendor: '',
    product: '',
    unit: '',
    rate: '',
    quantity: '',
  });

  const total = (parseFloat(formData.rate) || 0) * (parseFloat(formData.quantity) || 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vendor.trim() || !formData.product.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const rate = parseFloat(formData.rate);
    const quantity = parseFloat(formData.quantity);

    if (isNaN(rate) || rate <= 0) {
      toast.error('Please enter a valid rate');
      return;
    }

    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    addExpense({
      date: formData.date,
      vendor: formData.vendor.trim(),
      product: formData.product.trim(),
      unit: formData.unit.trim(),
      rate,
      quantity,
    });

    toast.success('Expense added successfully!');

    // Reset form
    setFormData({
      date: getDefaultDate(),
      vendor: '',
      product: '',
      unit: '',
      rate: '',
      quantity: '',
    });
  };

  const handleReset = () => {
    setFormData({
      date: getDefaultDate(),
      vendor: '',
      product: '',
      unit: '',
      rate: '',
      quantity: '',
    });
  };

  const handleAddAnother = (e: React.FormEvent) => {
    handleSubmit(e);
  };

  const handleAddAndView = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vendor.trim() || !formData.product.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const rate = parseFloat(formData.rate);
    const quantity = parseFloat(formData.quantity);

    if (isNaN(rate) || rate <= 0 || isNaN(quantity) || quantity <= 0) {
      toast.error('Please enter valid rate and quantity');
      return;
    }

    addExpense({
      date: formData.date,
      vendor: formData.vendor.trim(),
      product: formData.product.trim(),
      unit: formData.unit.trim(),
      rate,
      quantity,
    });

    toast.success('Expense added successfully!');
    navigate('/expenses');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-6 w-6 text-primary" />
              Add New Expense
            </CardTitle>
            <CardDescription>Enter the details of your expense below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Vendor *</Label>
                  <VendorCombobox
                    value={formData.vendor}
                    onChange={(value) => setFormData((prev) => ({ ...prev, vendor: value }))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="space-y-2">
                    <Label>Product *</Label>
                    <ProductCombobox
                      value={formData.product}
                      onChange={(value) => setFormData((prev) => ({ ...prev, product: value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    name="unit"
                    placeholder="e.g., kg, liters, pieces"
                    value={formData.unit}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate">Rate (A$) *</Label>
                  <Input
                    id="rate"
                    name="rate"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.rate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Total Display */}
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Total Amount</span>
                  <span className="text-3xl font-bold text-primary">
                    A${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-calculated: Rate × Quantity
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" className="flex-1">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add & Continue
                </Button>
                <Button type="button" onClick={handleAddAndView} variant="secondary" className="flex-1">
                  Add & View List
                </Button>
                <Button type="button" onClick={handleReset} variant="outline" size="icon">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AddExpense;
