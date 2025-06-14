'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { apiClient, Table } from '@/lib/api';
import { Loading } from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';
import { Plus, QrCode, Trash2, Download, Eye } from 'lucide-react';

export default function TableManagement() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [qrPreview, setQrPreview] = useState<{ tableNum: number; url: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTables();
    }
  }, [isAuthenticated]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const tablesData = await apiClient.getTables();
      setTables(tablesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tables",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const tableNum = parseInt(tableNumber);
    if (isNaN(tableNum) || tableNum <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid table number",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiClient.createTable(tableNum);
      toast({
        title: "Success",
        description: "Table created successfully",
      });
      setIsDialogOpen(false);
      setTableNumber('');
      fetchTables();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create table",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTable = async (tableNum: number) => {
    if (!confirm(`Are you sure you want to delete Table ${tableNum}?`)) return;

    try {
      await apiClient.deleteTable(tableNum);
      toast({
        title: "Success",
        description: "Table deleted successfully",
      });
      fetchTables();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete table",
        variant: "destructive",
      });
    }
  };

  const handleViewQR = async (tableNum: number) => {
    try {
      const response = await apiClient.getQRImage(tableNum);
      setQrPreview({ tableNum, url: response.qr_image_url });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const handleDownloadQR = async (tableNum: number) => {
    try {
      const response = await apiClient.getQRImage(tableNum);
      const link = document.createElement('a');
      link.href = response.qr_image_url;
      link.download = `table-${tableNum}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      });
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Table Management</h1>
            <p className="text-gray-600 mt-2">Manage restaurant tables and QR codes</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Table
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Add New Table</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTable} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tableNumber">Table Number</Label>
                  <Input
                    id="tableNumber"
                    type="number"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Enter table number"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Create Table
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : tables.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <QrCode className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tables yet</h3>
              <p className="text-gray-500 text-center mb-4">
                Create your first table to get started
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Table
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tables.map((table) => (
              <Card key={table._id} className="text-center">
                <CardHeader>
                  <CardTitle className="text-xl">Table {table.table_number}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <QrCode className="h-16 w-16 text-amber-600" />
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleViewQR(table.table_number)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View QR Code
                    </Button>
                    
                    <Button
                      onClick={() => handleDownloadQR(table.table_number)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download QR
                    </Button>
                    
                    <Button
                      onClick={() => handleDeleteTable(table.table_number)}
                      variant="outline"
                      size="sm"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500">
                    Created: {new Date(table.created_at!).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* QR Preview Dialog */}
        <Dialog open={!!qrPreview} onOpenChange={() => setQrPreview(null)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>QR Code - Table {qrPreview?.tableNum}</DialogTitle>
            </DialogHeader>
            {qrPreview && (
              <div className="text-center space-y-4">
                <img
                  src={qrPreview.url}
                  alt={`QR Code for Table ${qrPreview.tableNum}`}
                  className="mx-auto w-64 h-64 border rounded-lg"
                />
                <p className="text-sm text-gray-600">
                  Customers can scan this QR code to access the menu for Table {qrPreview.tableNum}
                </p>
                <Button
                  onClick={() => handleDownloadQR(qrPreview.tableNum)}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}