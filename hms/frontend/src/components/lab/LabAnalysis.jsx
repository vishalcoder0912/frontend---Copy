import { AlertTriangle, CheckCircle, Info, TrendingDown, TrendingUp, Activity, FileText, Beaker, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

export default function LabAnalysis({ analyzedData, className = "" }) {
  if (!analyzedData || Object.keys(analyzedData).length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-4 text-center text-slate-500">
          <Beaker className="h-8 w-8 mx-auto mb-2 text-slate-300" />
          <p>No analysis data available</p>
        </CardContent>
      </Card>
    );
  }

  const parameters = analyzedData.parameters || [];
  const findings = analyzedData.findings || [];
  const recommendations = analyzedData.recommendations || [];
  const criticalCount = analyzedData.criticalCount || 0;

  const normalCount = parameters.filter(p => p.status === "normal").length;
  const abnormalCount = parameters.length - normalCount;
  const normalPercent = parameters.length > 0 ? (normalCount / parameters.length) * 100 : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-sky-600" />
            Lab Analysis Report
            {analyzedData.category && (
              <Badge variant="outline" className="ml-2">{analyzedData.category}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Overall Status:</span>
              {criticalCount > 0 ? (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Critical
                </Badge>
              ) : abnormalCount > 0 ? (
                <Badge variant="warning" className="bg-amber-100 text-amber-800 border-amber-200 gap-1">
                  <Info className="h-3 w-3" />
                  Abnormal
                </Badge>
              ) : (
                <Badge variant="success" className="bg-green-100 text-green-800 border-green-200 gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Normal
                </Badge>
              )}
            </div>
            <span className="text-sm text-slate-500">
              {normalPercent.toFixed(0)}% Normal
            </span>
          </div>
          <Progress value={normalPercent} className="h-2" />

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{normalCount}</p>
              <p className="text-xs text-green-700">Normal</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">{abnormalCount}</p>
              <p className="text-xs text-amber-700">Abnormal</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              <p className="text-xs text-red-700">Critical</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {parameters.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Test Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {parameters.map((param, index) => (
                <div key={index} className={`p-3 rounded-lg border ${param.highlight ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-800">{param.parameter}</span>
                    <div className="flex items-center gap-2">
                      {param.status === "high" && <TrendingUp className="h-4 w-4 text-red-500" />}
                      {param.status === "low" && <TrendingDown className="h-4 w-4 text-blue-500" />}
                      <Badge 
                        variant={
                          param.status === "high" ? "destructive" : 
                          param.status === "low" ? "secondary" : 
                          "success"
                        }
                        className={
                          param.status === "normal" ? "bg-green-100 text-green-800 border-green-200" : ""
                        }
                      >
                        {param.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-600">
                      Value: <strong>{param.value}</strong> {param.unit}
                    </span>
                    {param.range && (
                      <span className="text-slate-500">
                        Range: {param.range} {param.unit}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {findings.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Key Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {findings.map((finding, index) => (
                <div 
                  key={index} 
                  className={`flex items-start gap-2 p-2 rounded-lg ${
                    finding.type === "critical" ? "bg-red-50 text-red-800" :
                    finding.type === "alert" ? "bg-amber-50 text-amber-800" :
                    "bg-blue-50 text-blue-800"
                  }`}
                >
                  {finding.type === "critical" && <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                  {finding.type === "alert" && <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                  {finding.type === "info" && <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                  <span className="text-sm">{finding.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <div 
                  key={index} 
                  className={`flex items-start gap-2 p-2 rounded-lg ${
                    rec.priority === "high" ? "bg-red-50 border border-red-200" :
                    rec.priority === "medium" ? "bg-amber-50 border border-amber-200" :
                    "bg-slate-50 border border-slate-200"
                  }`}
                >
                  <Badge 
                    variant="outline" 
                    className={`flex-shrink-0 ${
                      rec.priority === "high" ? "border-red-300 text-red-700" :
                      rec.priority === "medium" ? "border-amber-300 text-amber-700" :
                      "border-slate-300 text-slate-700"
                    }`}
                  >
                    {rec.priority}
                  </Badge>
                  <span className="text-sm text-slate-700">{rec.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {analyzedData.summary && (
        <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
          <p className="text-sm text-sky-800">
            <strong>Summary:</strong> {analyzedData.summary}
          </p>
          {analyzedData.analyzedAt && (
            <p className="text-xs text-sky-600 mt-1">
              Analyzed: {new Date(analyzedData.analyzedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
