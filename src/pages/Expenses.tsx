import { useState, useMemo, useRef } from 'react';
import { useExpenses } from '@/contexts/ExpenseContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Download, Upload, Trash2, Search, X, FileSpreadsheet } from 'lucide-react';

const Expenses = () => {
  const { expenses, deleteExpense, exportToExcel, importFromExcel } = useExpenses();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [filters, setFilters] = useState({
    search: '',
    dateFrom: '',
    dateTo: '',
    vendor: '',
    product: '',
  });

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        !filters.search ||
        expense.vendor.toLowerCase().includes(searchLower) ||
        expense.product.toLowerCase().includes(searchLower) ||
        expense.unit.toLowerCase().includes(searchLower);

      const matchesDateFrom = !filters.dateFrom || expense.date >= filters.dateFrom;
      const matchesDateTo = !filters.dateTo || expense.date <= filters.dateTo;
      const matchesVendor =
        !filters.vendor || expense.vendor.toLowerCase().includes(filters.vendor.toLowerCase());
      const matchesProduct =
        !filters.product || expense.product.toLowerCase().includes(filters.product.toLowerCase());

      return matchesSearch && matchesDateFrom && matchesDateTo && matchesVendor && matchesProduct;
    });
  }, [expenses, filters]);

  const totalFiltered = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.total, 0);
  }, [filteredExpenses]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      dateFrom: '',
      dateTo: '',
      vendor: '',
      product: '',
    });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importFromExcel(file);
      toast.success('Expenses imported successfully!');
    } catch (error) {
      toast.error('Failed to import file. Please check the format.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (id: string) => {
    deleteExpense(id);
    toast.success('Expense deleted');
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Expenses</h1>
            <p className="text-muted-foreground">View and manage all your expenses</p>
          </div>

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              className="hidden"
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button onClick={exportToExcel} disabled={expenses.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  name="search"
                  placeholder="Search..."
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateFrom">From Date</Label>
                <Input
                  id="dateFrom"
                  name="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">To Date</Label>
                <Input
                  id="dateTo"
                  name="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Input
                  id="vendor"
                  name="vendor"
                  placeholder="Filter by vendor"
                  value={filters.vendor}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Input
                  id="product"
                  name="product"
                  placeholder="Filter by product"
                  value={filters.product}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-4">
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {filteredExpenses.length} of {expenses.length} expenses
          </span>
          <span className="font-medium text-foreground">
            Total: A${totalFiltered.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {filteredExpenses.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">SN</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.sn}</TableCell>
                        <TableCell>{expense.date}</TableCell>
                        <TableCell>{expense.vendor}</TableCell>
                        <TableCell>{expense.product}</TableCell>
                        <TableCell>{expense.unit || '-'}</TableCell>
                        <TableCell className="text-right">A${expense.rate.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{expense.quantity}</TableCell>
                        <TableCell className="text-right font-medium">
                          A${expense.total.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this expense? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(expense.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <FileSpreadsheet className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No expenses found</p>
                <p className="text-sm">
                  {hasActiveFilters
                    ? 'Try adjusting your filters'
                    : 'Start by adding your first expense'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Expenses;
