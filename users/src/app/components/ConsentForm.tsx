"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Submission } from "@/types";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";

interface ConsentFormProps {
  submission: Submission;
  formText: string;
  formTitle: string;
  documentUrl: string;
  documentName: string;
  onAgree: () => void;
  onDisagree: () => void;
}

export default function ConsentForm({
  submission,
  formText,
  formTitle,
  documentUrl,
  documentName,
  onAgree,
  onDisagree,
}: ConsentFormProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);

  const handleAgree = async () => {
    onAgree();
  };

  const handleDisagree = () => {
    setShowDialog(true);
  };

  const confirmDisagree = () => {
    onDisagree();
  };

  return (
    <div className="max-w-3xl mx-auto p-6 border border-gray-300 rounded-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{formTitle}</h2>
        <Button variant="outline" onClick={() => window.open(documentUrl, "_blank")}>
          <Download className="mr-2 h-4 w-4" />
          Download {documentName}
        </Button>
      </div>

      <div className="mb-8 prose max-w-none">
        <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md border border-gray-200 max-h-[60vh] overflow-y-auto">
          {formText}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="default" onClick={handleAgree} className="px-8">
          Agree
        </Button>
        <Button variant="outline" onClick={handleDisagree} className="px-8">
          Don&apos;t Agree
        </Button>
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Warning</AlertDialogTitle>
            <AlertDialogDescription>
              The study will end and the data will be deleted if you don&apos;t agree with this consent form. Are you
              sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDisagree}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
