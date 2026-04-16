import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Beaker, 
  FileText, 
  Upload, 
  X, 
  Eye, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Download,
  Search,
  Filter,
  LayoutGrid,
  List
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Textarea } from "../components/ui/textarea";
import EmptyState from "../components/shared/EmptyState";
import FileDropZone from "../components/shared/FileDropZone";
import LoadingSkeleton from "../components/shared/LoadingSkeleton";
import Pagination from "../components/shared/Pagination";
import LabAnalysis from "../components/lab/LabAnalysis";
import useDebounce from "../hooks/useDebounce";
import useDoctors from "../hooks/useDoctors";
import useLab from "../hooks/useLab";
import usePatients from "../hooks/usePatients";
import labService from "../services/labService";
import { BADGE_VARIANTS, STATUS } from "../utils/constants";

const TEST_CATEGORIES = {
  HEMATOLOGY: "Hematology",
  BIOCHEMISTRY: "Biochemistry",
  MICROBIOLOGY: "Microbiology",
  HISTOPATHOLOGY: "Histopathology",
  RADIOLOGY: "Radiology",
  CARDIOLOGY: "Cardiology",
  ENDOCRINOLOGY: "Endocrinology",
  IMMUNOLOGY: "Immunology",
  URINALYSIS: "Urinalysis",
  COAGULATION: "Coagulation",
  GENERAL: "General",
};

const PRIORITY_LEVELS = {
  ROUTINE: "Routine",
  URGENT: "Urgent",
  STAT: "Stat",
};

const SPECIMEN_TYPES = {
  BLOOD: "Blood",
  URINE: "Urine",
  STOOL: "Stool",
  SPUTUM: "Sputum",
  TISSUE: "Tissue",
  CSF: "CSF",
  IMAGING: "Imaging",
  OTHER: "Other",
};

const schema = z.object({
  patient_id: z.coerce.number().min(1, "Patient required"),
  doctor_id: z.coerce.number().min(1, "Doctor required"),
  test_name: z.string().min(2, "Test name required"),
  result: z.string().optional(),
  status: z.enum(STATUS.lab),
  test_category: z.string().optional(),
  priority: z.string().optional(),
  specimen_type: z.string().optional(),
});

export default function Lab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [analyzingFiles, setAnalyzingFiles] = useState(false);
  const [viewAnalysis, setViewAnalysis] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const debouncedSearch = useDebounce(search, 300);
  
  const { data, isLoading, error, createLabOrder, updateLabOrder, creating, updating } = useLab({
    page: 1,
    limit: 200,
    search: debouncedSearch,
    category: filterCategory !== "all" ? filterCategory : undefined,
  });
  
  const patientsData = usePatients({ page: 1, limit: 200 })?.data?.items;
  const patients = useMemo(() => patientsData || [], [patientsData]);
  const doctorsData = useDoctors({ page: 1, limit: 200 })?.data?.items;
  const doctors = useMemo(() => doctorsData || [], [doctorsData]);
  const items = useMemo(() => data?.items || [], [data?.items]);
  const totalPages = Math.max(1, Math.ceil(items.length / 10));
  const pagedItems = useMemo(() => items.slice((page - 1) * 10, page * 10), [items, page]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { 
      patient_id: "", 
      doctor_id: "", 
      test_name: "", 
      result: "", 
      status: "Pending",
      test_category: "GENERAL",
      priority: "Routine",
      specimen_type: "BLOOD",
    },
  });

  const handleFilesSelected = (files) => {
    setUploadedFiles(files);
    setSelectedFiles(files.map((file, index) => ({
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: "pending",
    })));
  };

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadedFiles(prev => {
      const fileToRemove = selectedFiles.find(f => f.id === fileId);
      return prev.filter(f => f !== fileToRemove?.file);
    });
  };

  const saveOrder = async (values) => {
    setAnalyzingFiles(true);
    try {
      const formData = new FormData();
      formData.append("patient_id", values.patient_id);
      formData.append("doctor_id", values.doctor_id);
      formData.append("test_name", values.test_name);
      formData.append("result", values.result || "");
      formData.append("status", values.status);
      formData.append("test_category", values.test_category || "GENERAL");
      formData.append("priority", values.priority || "Routine");
      formData.append("specimen_type", values.specimen_type || "BLOOD");
      
      uploadedFiles.forEach((file) => {
        formData.append("files", file);
      });

      if (editing) {
        await updateLabOrder({ id: editing.id, payload: formData, isFormData: true });
      } else {
        const result = await labService.createLabOrder(formData);
        if (uploadedFiles.length > 0 && result.data?.id) {
          await labService.uploadLabReports(result.data.id, uploadedFiles, (progress) => {
            console.log("Upload progress:", progress);
          });
        }
      }
      
      handleDialogClose(false);
    } catch (error) {
      console.error("Error saving lab order:", error);
    } finally {
      setAnalyzingFiles(false);
    }
  };

  const handleDialogClose = (open) => {
    if (!open) {
      setEditing(null);
      setUploadedFiles([]);
      setSelectedFiles([]);
      form.reset({ 
        patient_id: "", 
        doctor_id: "", 
        test_name: "", 
        result: "", 
        status: "Pending",
        test_category: "GENERAL",
        priority: "Routine",
        specimen_type: "BLOOD",
      });
    }
    setOpen(open);
  };

  const openEditDialog = (item) => {
    setEditing(item);
    const fileUrls = item.file_urls || [];
    form.reset({
      patient_id: item.patient_id,
      doctor_id: item.doctor_id,
      test_name: item.test_name,
      result: item.result || "",
      status: item.status,
      test_category: item.test_category || "GENERAL",
      priority: item.priority || "Routine",
      specimen_type: item.specimen_type || "BLOOD",
    });
    setSelectedFiles(fileUrls.map((f, i) => ({
      id: `existing-${i}`,
      name: f.filename || f.url?.split("/").pop() || `File ${i + 1}`,
      url: f.url,
      size: f.size || 0,
      type: f.type || "application/octet-stream",
      status: "uploaded",
    })));
    setOpen(true);
  };

  const getStatusBadge = (status) => {
    const variants = {
      Pending: "warning",
      Completed: "success",
      "In Progress": "info",
      Cancelled: "destructive",
    };
    return variants[status] || "secondary";
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      Routine: "secondary",
      Urgent: "warning",
      Stat: "destructive",
    };
    return variants[priority] || "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Lab</h1>
          <p className="text-sm text-slate-500">Track live lab orders, upload reports, and view automated analysis.</p>
        </div>
        <Button className="bg-sky-600 hover:bg-sky-700" onClick={() => setOpen(true)}>
          <Beaker className="mr-2 h-4 w-4" />
          Add Lab Order
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by patient, doctor, or test"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(TEST_CATEGORIES).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : error ? (
        <EmptyState
          title="Lab data unavailable"
          description={error.message || "Unable to load lab orders."}
        />
      ) : pagedItems.length === 0 ? (
        <EmptyState title="No lab orders" description="Create the first lab order." />
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Test</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Files</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.patient_name}</TableCell>
                  <TableCell>{item.doctor_name}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.test_name}</p>
                      {item.specimen_id && (
                        <p className="text-xs text-slate-500">{item.specimen_id}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.test_category || "General"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(item.status)}>{item.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityBadge(item.priority)}>{item.priority || "Routine"}</Badge>
                  </TableCell>
                  <TableCell>
                    {(item.file_urls?.length > 0 || item.analyzed_data) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewAnalysis(item)}
                        className="gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        {item.analyzed_data?.criticalCount > 0 ? (
                          <span className="text-red-600">
                            <AlertTriangle className="h-3 w-3 inline" />
                          </span>
                        ) : item.file_urls?.length > 0 ? (
                          <span className="text-sky-600">
                            <FileText className="h-3 w-3 inline" />
                          </span>
                        ) : null}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(item)}
                      >
                        Edit
                      </Button>
                      {item.file_urls?.length > 0 && (
                        <a
                          href={item.file_urls[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                        >
                          <Button variant="ghost" size="sm">
                            <Download className="h-3 w-3" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Update Lab Order" : "Create Lab Order"}
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Order Details</TabsTrigger>
              <TabsTrigger value="files">
                Files ({selectedFiles.length})
              </TabsTrigger>
              <TabsTrigger value="analysis">
                Analysis
                {editing?.analyzed_data && (
                  <Badge variant="success" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                    <CheckCircle className="h-3 w-3" />
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Patient *</label>
                  <Select 
                    value={String(form.watch("patient_id") || "")} 
                    onValueChange={(value) => form.setValue("patient_id", Number(value))}
                  >
                    <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={String(patient.id)}>
                          {patient.name} ({patient.patient_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Doctor *</label>
                  <Select 
                    value={String(form.watch("doctor_id") || "")} 
                    onValueChange={(value) => form.setValue("doctor_id", Number(value))}
                  >
                    <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={String(doctor.id)}>
                          {doctor.name} ({doctor.specialization})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Test Name *</label>
                  <Input {...form.register("test_name")} placeholder="e.g., Complete Blood Count, Lipid Profile" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Category</label>
                  <Select 
                    value={form.watch("test_category") || "GENERAL"} 
                    onValueChange={(value) => form.setValue("test_category", value)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(TEST_CATEGORIES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Priority</label>
                  <Select 
                    value={form.watch("priority") || "Routine"} 
                    onValueChange={(value) => form.setValue("priority", value)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_LEVELS).map(([key, label]) => (
                        <SelectItem key={key} value={label}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Specimen Type</label>
                  <Select 
                    value={form.watch("specimen_type") || "BLOOD"} 
                    onValueChange={(value) => form.setValue("specimen_type", value)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select specimen" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(SPECIMEN_TYPES).map(([key, label]) => (
                        <SelectItem key={key} value={label}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <Select 
                    value={form.watch("status")} 
                    onValueChange={(value) => form.setValue("status", value)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      {STATUS.lab.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Result / Notes</label>
                  <Textarea 
                    {...form.register("result")} 
                    placeholder="Enter test result details, observations, or notes..."
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="files" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <FileDropZone
                    onFilesSelected={handleFilesSelected}
                    multiple={true}
                    title="Drop lab reports here, or click to browse"
                    description="Supports: PDF, Images, Word, Text (Max 10MB each, up to 10 files)"
                  />
                </CardContent>
              </Card>

              {selectedFiles.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Uploaded Files ({selectedFiles.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedFiles.map((file) => (
                        <div
                          key={file.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            file.status === "uploaded" 
                              ? "bg-green-50 border-green-200" 
                              : "bg-white border-slate-200"
                          }`}
                        >
                          <FileText className={`h-5 w-5 ${
                            file.status === "uploaded" ? "text-green-600" : "text-sky-600"
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {file.url ? (
                                <span className="text-green-600">Uploaded</span>
                              ) : (
                                `Size: ${(file.size / 1024).toFixed(1)} KB`
                              )}
                            </p>
                          </div>
                          {file.status !== "uploaded" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedFiles.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-slate-500">
                    <Upload className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p>No files uploaded yet</p>
                    <p className="text-sm">Upload lab reports for automatic analysis</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              {editing?.analyzed_data ? (
                <LabAnalysis analyzedData={editing.analyzed_data} />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-slate-500">
                    <Beaker className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p>No analysis available</p>
                    <p className="text-sm">
                      Upload files or enter results to generate automatic analysis
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button 
              className="bg-sky-600 hover:bg-sky-700" 
              onClick={form.handleSubmit(saveOrder)} 
              disabled={creating || updating || analyzingFiles}
            >
              {analyzingFiles ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : creating || updating ? (
                "Saving..."
              ) : (
                "Save Order"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewAnalysis} onOpenChange={() => setViewAnalysis(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5 text-sky-600" />
              Lab Analysis Report
              <Badge variant="outline">{viewAnalysis?.test_name}</Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-500">Patient</p>
                <p className="font-medium">{viewAnalysis?.patient_name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Doctor</p>
                <p className="font-medium">{viewAnalysis?.doctor_name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Category</p>
                <p className="font-medium">{viewAnalysis?.test_category || "General"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <Badge variant={getStatusBadge(viewAnalysis?.status)}>{viewAnalysis?.status}</Badge>
              </div>
            </div>

            {viewAnalysis?.analyzed_data && (
              <LabAnalysis analyzedData={viewAnalysis.analyzed_data} />
            )}

            {viewAnalysis?.file_urls?.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Attached Files ({viewAnalysis.file_urls.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {viewAnalysis.file_urls.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-white"
                      >
                        <FileText className="h-5 w-5 text-sky-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {file.filename || `File ${index + 1}`}
                          </p>
                          <p className="text-xs text-slate-500">{file.type || "Document"}</p>
                        </div>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                        >
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {viewAnalysis?.result && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Raw Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{viewAnalysis.result}</p>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewAnalysis(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
