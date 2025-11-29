// src/hooks/useResidentManagement.js
// ⬅ این نسخه فقط با بک‌اند کار می‌کند و دیگر از localStorage برای ساکنین استفاده نمی‌کند

import { useState, useEffect, useCallback, useMemo } from "react";
import { addDays } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import axiosClient from "@/api/axiosClient";

// فرم خالی اولیه
const defaultResidentFormData = {
  fullName: "",
  nickname: "",
  email: "",
  phoneNumber: "",   
  unitNumber: "",
  floorNumber: "",
  kioskDisplayName: "",
  passcode: "",
  invitationSendMethod: "email",
  invitationExpirationDate: addDays(new Date(), 7).toISOString(),
  status: "invited",
  referralCode: "",
  invitationLink: "",
};

const generateReferralCode = (unitNumber) =>
  `RES-${unitNumber}-${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;

export const useResidentManagement = (loggedInManager) => {
  const { toast } = useToast();

  const [residents, setResidents] = useState([]);
  const [buildingUnits, setBuildingUnits] = useState([]);
  const [buildingDetails, setBuildingDetails] = useState({});

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  const [viewingMembersForResident, setViewingMembersForResident] =
    useState(null);
  const [isViewMembersDialogOpen, setIsViewMembersDialogOpen] =
    useState(false);
  const [isInvitationPreviewOpen, setIsInvitationPreviewOpen] = useState(false);
  const [residentFormData, setResidentFormData] = useState(
    defaultResidentFormData
  );

  const [selectedResidents, setSelectedResidents] = useState([]);
  const [isManager] = useState(loggedInManager?.role === "manager");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // =============================
  // 🔹 Load building + units + residents from backend
  // =============================
  useEffect(() => {
    const load = async () => {
      try {
        if (!loggedInManager?.buildingUid) return; 
        const buildingUid = loggedInManager?.buildingUid;
        if (!buildingUid) {
          console.warn("No buildingUid on loggedInManager");
          setLoadingInitial(false);
          return;
        }

        //  GET /api/units/:buildingUid)
        const [unitsRes, buildingRes, residentsRes] = await Promise.all([
          axiosClient.get(`/units/${buildingUid}`),
          axiosClient.get(`/building/${buildingUid}`),
          axiosClient.get(`/manager/residents`),
        ]);

        // فرض: unitsRes.data.units
        setBuildingUnits(
          (unitsRes.data.units || []).map((u) => ({
            ...u,
            identifier: String(u.identifier),
          }))
        );

        // buildingRes.data یا { success:true, building } – بسته به کنترلر
        const bd =
          buildingRes.data.building || buildingRes.data || { buildingUid };
        setBuildingDetails(bd);

        // residentsRes.data.residents
        const rs = residentsRes.data.residents || [];
        setResidents(
          rs.map((r) => ({
            ...r,
            id: r.id || r._id, // مطمئن می‌شویم id برای جدول وجود دارد
          }))
        );
      } catch (err) {
        console.error("Load resident data error:", err);
        toast({
          title: "Error loading residents",
          description: "Could not load residents data from server.",
          variant: "destructive",
        });
      } finally {
        setLoadingInitial(false);
      }
    };

    load();
  }, [loggedInManager?.buildingUid, toast]);
  // 📌 Available Units (فقط یونیت‌هایی که Resident ندارند)
 
  const availableUnits = useMemo(() => {
    const assignedUnitIdentifiers = residents
      .filter((r) => !editingResident || r.id !== editingResident.id)
      .map((r) => String(r.unitNumber));

    return buildingUnits
      .filter((u) => !assignedUnitIdentifiers.includes(String(u.identifier)))
      .map((u) => ({
        unit: String(u.identifier),
        floor: String(u.floor),
        label: u.label || "",
      }));
  }, [buildingUnits, residents, editingResident]);

  // 📌 Reset Form
  // =============================
  const resetForm = useCallback(() => {
    setResidentFormData(defaultResidentFormData);
    setEditingResident(null);
  }, []);

  // 📌 Handle Input Change
  // =============================
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setResidentFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // =============================
  // 📌 Unit selection
  // =============================
  const handleUnitSelection = useCallback(
    (selectedUnitIdentifier) => {
      const selectedUnitDetails = buildingUnits.find(
        (u) => String(u.identifier) === selectedUnitIdentifier
      );
      if (selectedUnitDetails) {
        setResidentFormData((prev) => ({
          ...prev,
          unitNumber: selectedUnitDetails.identifier,
          floorNumber: selectedUnitDetails.floor,
        }));
      } else if (
        editingResident &&
        String(editingResident.unitNumber) === selectedUnitIdentifier
      ) {
        // اگر در حالت ویرایش خودش همان یونیت را انتخاب کرد
        setResidentFormData((prev) => ({
          ...prev,
          unitNumber: editingResident.unitNumber,
          floorNumber: editingResident.floorNumber,
        }));
      } else {
        setResidentFormData((prev) => ({
          ...prev,
          unitNumber: "",
          floorNumber: "",
        }));
      }
    },
    [buildingUnits, editingResident]
  );

  // =============================
  // 📌 Invitation data (referralCode + link)
  // =============================
  const prepareInvitationData = useCallback(
    (currentData) => {
      const code =
        currentData.referralCode ||
        generateReferralCode(currentData.unitNumber || "UNIT");

      const link =
        currentData.invitationLink ||
        `${window.location.origin}/signup/residents?referralCode=${code}&email=${encodeURIComponent(
          currentData.email
        )}&name=${encodeURIComponent(
          currentData.fullName
        )}&unitNumber=${encodeURIComponent(
          currentData.unitNumber
        )}&buildingUid=${encodeURIComponent(
          loggedInManager?.buildingUid || "default_building"
        )}`;

      return {
        ...currentData,
        referralCode: code,
        invitationLink: link,
      };
    },
    [loggedInManager?.buildingUid]
  );

  // =============================
  // 📌 Preview Invitation
  // =============================
  const handlePreviewInvitation = useCallback(() => {
    if (
      !residentFormData.fullName ||
      !residentFormData.email ||
      !residentFormData.unitNumber
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in Name, Email, and Unit before previewing.",
        variant: "destructive",
      });
      return;
    }

    const dataWithInviteDetails = prepareInvitationData(residentFormData);
    setResidentFormData(dataWithInviteDetails);
    setIsInvitationPreviewOpen(true);
  }, [residentFormData, prepareInvitationData, toast]);

  // =============================
  // 📌 Create or Update Resident  (به بک‌اند)
  // =============================
  const handleSubmitResident = useCallback(async () => {
    setIsSubmitting(true);
    try {
      if (!isManager) {
        toast({
          title: "Permission Denied",
          variant: "destructive",
        });
        return;
      }
      
      if (
        !residentFormData.fullName ||
        !residentFormData.email ||
        !residentFormData.unitNumber ||
        !residentFormData.floorNumber
      ) {
        toast({
          title: "Error",
          description: "Full Name, Email, Unit, and Floor are required.",
          variant: "destructive",
        });
        return;
      }

      if (!editingResident && !residentFormData.invitationExpirationDate) {
        toast({
          title: "Error",
          description: "Invitation expiration date is required.",
          variant: "destructive",
        });
        return;
      }

      let finalResidentData = prepareInvitationData(residentFormData);

      if (editingResident) {
        // UPDATE
        const resp = await axiosClient.put(
          `/manager/residents/${editingResident.id}`,
          {
            fullName: finalResidentData.fullName,
            nickname: finalResidentData.nickname,
            email: finalResidentData.email,
            phoneNumber: finalResidentData.phoneNumber,
            unitNumber: finalResidentData.unitNumber,
            floorNumber: finalResidentData.floorNumber,
            kioskDisplayName:
              finalResidentData.kioskDisplayName || finalResidentData.fullName,
            status: finalResidentData.status,
            referralCode: finalResidentData.referralCode,
            invitationLink: finalResidentData.invitationLink,
            invitationExpirationDate:
              finalResidentData.invitationExpirationDate,
          }
        );

        const updated = resp.data.resident;
        setResidents((prev) =>
          prev.map((r) => (r.id === editingResident.id ? updated : r))
        );

        toast({
          title: "Resident Updated",
          description: `${updated.fullName} has been updated.`,
        });
      } else {
        // CREATE
        const resp = await axiosClient.post(`/manager/residents`, {
  fullName: finalResidentData.fullName,
  nickname: finalResidentData.nickname,
  email: finalResidentData.email,
  phoneNumber: finalResidentData.phoneNumber,  
  unitNumber: finalResidentData.unitNumber,
  floorNumber: finalResidentData.floorNumber,
  kioskDisplayName:
  finalResidentData.kioskDisplayName || finalResidentData.fullName,
  status: "invited",
  referralCode: finalResidentData.referralCode,
  invitationLink: finalResidentData.invitationLink,
  invitationExpirationDate: finalResidentData.invitationExpirationDate,
  passcode: finalResidentData.passcode,            
  managerId: loggedInManager?._id,                
   buildingUid: loggedInManager?.buildingUid,        
  // ⭐ این دو مقدار بسیار مهم
  managerId: loggedInManager?._id,
  buildingUid: loggedInManager?.buildingUid,
});
        const created = resp.data.resident;
        setResidents((prev) => [...prev, created]);

        toast({
          title: "Invitation Created",
          description: `Invitation created for ${created.fullName}.`,
        });
      }

      resetForm();
      setIsFormDialogOpen(false);
    } catch (error) {
      console.error("handleSubmitResident error:", error);
      toast({
        title: "Submission Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isManager,
    residentFormData,
    editingResident,
    loggedInManager,
    prepareInvitationData,
    toast,
    resetForm,
  ]);

  // =============================
  // 📌 Edit Resident (پر کردن فرم)
  // =============================
  const handleEditResident = useCallback((resident) => {
    setEditingResident(resident);
    const dataForForm = {
      ...defaultResidentFormData,
      ...resident,
      unitNumber: String(resident.unitNumber || ""),
      cellphoneNumber: resident.phoneNumber || "",
      invitationExpirationDate:
        resident.invitationExpirationDate ||
        addDays(new Date(), 7).toISOString(),
      invitationSendMethod: resident.invitationSendMethod || "email",
      referralCode: resident.referralCode || "",
      invitationLink: resident.invitationLink || "",
    };
    setResidentFormData(dataForForm);
    setIsFormDialogOpen(true);
  }, []);

  // =============================
  // 📌 Delete Resident (بک‌اند)
  // =============================
  const handleDeleteResident = useCallback(
    async (residentId) => {
      if (!isManager) {
        toast({ title: "Permission Denied", variant: "destructive" });
        return;
      }
      if (
        !window.confirm(
          "Are you sure you want to remove this resident? This action cannot be undone."
        )
      ) {
        return;
      }

      try {
        await axiosClient.delete(`/manager/residents/${residentId}`);
        setResidents((prev) => prev.filter((r) => r.id !== residentId));
        toast({
          title: "Resident Removed",
          variant: "destructive",
        });
      } catch (err) {
        console.error("Delete resident error:", err);
        toast({
          title: "Error",
          description: "Could not delete resident.",
          variant: "destructive",
        });
      }
    },
    [isManager, toast]
  );

  // =============================
  // 📌 Resend Invitation (فقط شبیه‌سازی برای UI)
  // =============================
  const handleResendInvitation = useCallback(
    (resident) => {
      if (!isManager) {
        toast({ title: "Permission Denied", variant: "destructive" });
        return;
      }
      const dataWithInviteDetails = prepareInvitationData(resident);
      setResidentFormData({
        ...defaultResidentFormData,
        ...dataWithInviteDetails,
        cellphoneNumber: dataWithInviteDetails.phoneNumber || "",
      });
      setIsInvitationPreviewOpen(true);
    },
    [isManager, prepareInvitationData, toast]
  );

  // =============================
  // 📌 Reset Passcode (بک‌اند)
  // =============================
  const handleResetPasscode = useCallback(
    async (residentId) => {
      if (!isManager) {
        toast({ title: "Permission Denied", variant: "destructive" });
        return;
      }

      try {
        const resp = await axiosClient.post(
          `/manager/residents/${residentId}/reset-passcode`
        );
        const { resident, newPasscode } = resp.data;
        setResidents((prev) =>
          prev.map((r) => (r.id === residentId ? resident : r))
        );
        toast({
          title: "Passcode Reset",
          description: `New passcode ${newPasscode} generated.`,
        });
      } catch (err) {
        console.error("Reset passcode error:", err);
        toast({
          title: "Error",
          description: "Could not reset passcode.",
          variant: "destructive",
        });
      }
    },
    [isManager, toast]
  );

  // =============================
  // 📌 Send Reminder (Simulated)
  // =============================
  const handleSendReminder = useCallback(
    (residentId) => {
      const resident = residents.find((r) => r.id === residentId);
      if (resident && resident.status === "invited") {
        toast({
          title: "Activation Reminder Sent (Simulated)",
          description: `Reminder sent to ${resident.fullName}.`,
        });
      } else {
        toast({
          title: "Cannot Send Reminder",
          description: "Reminder can only be sent to 'Invited' residents.",
          variant: "destructive",
        });
      }
    },
    [residents, toast]
  );

  // =============================
  // 📌 Toggle Deactivate/Activate (بک‌اند)
  // =============================
  const handleToggleDeactivate = useCallback(
    async (residentId, deactivate) => {
      if (!isManager) {
        toast({ title: "Permission Denied", variant: "destructive" });
        return;
      }
      const newStatus = deactivate ? "inactive" : "active";
      try {
        const resp = await axiosClient.post(
          `/manager/residents/${residentId}/status`,
          { status: newStatus }
        );
        const updated = resp.data.resident;
        setResidents((prev) =>
          prev.map((r) => (r.id === residentId ? updated : r))
        );
        toast({
          title: `Resident ${deactivate ? "Deactivated" : "Activated"}`,
          description: "Account status updated.",
        });
      } catch (err) {
        console.error("Update status error:", err);
        toast({
          title: "Error",
          description: "Could not update status.",
          variant: "destructive",
        });
      }
    },
    [isManager, toast]
  );

  // =============================
  // 📌 View Access History (Placeholder)
  // =============================
  const handleViewAccessHistory = useCallback(
    (residentId) => {
      toast({
        title: "Access History (Placeholder)",
        description: "This feature will show the resident's system access log.",
      });
    },
    [toast]
  );

  // =============================
  // 📌 View Members (Dialog)
  // =============================
  const handleViewMembers = useCallback((resident) => {
    setViewingMembersForResident(resident);
    setIsViewMembersDialogOpen(true);
  }, []);

  // =============================
  // 📌 Select / Bulk Select
  // =============================
  const handleSelectResident = useCallback((residentId) => {
    setSelectedResidents((prev) =>
      prev.includes(residentId)
        ? prev.filter((id) => id !== residentId)
        : [...prev, residentId]
    );
  }, []);

  const handleBulkInvite = useCallback(() => {
    toast({
      title: "Bulk Invite (Simulated)",
      description: "This will send invitations in bulk.",
    });
  }, [toast]);

  const handleBulkAssignGroup = useCallback(
    () =>
      toast({
        title: "Bulk Assign to Group (Placeholder)",
        description: "This will assign selected residents to a group.",
      }),
    [toast]
  );

  const handleBulkExportCSV = useCallback(
    (filteredResidentsForExport) => {
      const dataToExport = filteredResidentsForExport.filter((r) =>
        selectedResidents.includes(r.id)
      );
      if (dataToExport.length === 0) {
        toast({
          title: "No Residents Selected",
          description: "Please select residents to export.",
          variant: "destructive",
        });
        return;
      }
      const headers = [
        "Full Name",
        "Email",
        "Unit",
        "Floor",
        "Status",
        "Phone",
        "Kiosk Display Name",
        "Referral Code",
        "Invitation Link",
      ];
      const csvRows = [
        headers.join(","),
        ...dataToExport.map((r) =>
          [
            `"${r.fullName || ""}"`,
            `"${r.email || ""}"`,
            `"${r.unitNumber || ""}"`,
            `"${r.floorNumber || ""}"`,
            `"${r.status || ""}"`,
            `"${r.phoneNumber || ""}"`,
            `"${r.kioskDisplayName || ""}"`,
            `"${r.referralCode || ""}"`,
            `"${r.invitationLink || ""}"`,
          ].join(",")
        ),
      ];
      const csvString = csvRows.join("\n");
      const blob = new Blob([csvString], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "residents_export.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      toast({
        title: "CSV Exported",
        description: `${dataToExport.length} residents exported.`,
      });
    },
    [selectedResidents, toast]
  );

  const handleBulkExportPDF = useCallback(
    () =>
      toast({
        title: "Bulk Export to PDF (Placeholder)",
        description: "This will generate a PDF.",
      }),
    [toast]
  );

  const handleBulkDeactivate = useCallback(async () => {
    if (!isManager) {
      toast({ title: "Permission Denied", variant: "destructive" });
      return;
    }

    try {
      await Promise.all(
        selectedResidents.map((id) =>
          axiosClient.post(`/manager/residents/${id}/status`, {
            status: "inactive",
          })
        )
      );
      setResidents((prev) =>
        prev.map((r) =>
          selectedResidents.includes(r.id) ? { ...r, status: "inactive" } : r
        )
      );
      toast({
        title: "Bulk Deactivate",
        description: `${selectedResidents.length} residents deactivated.`,
      });
      setSelectedResidents([]);
    } catch (err) {
      console.error("Bulk deactivate error:", err);
      toast({
        title: "Error",
        description: "Could not deactivate selection.",
        variant: "destructive",
      });
    }
  }, [isManager, selectedResidents, toast]);

  const handleBulkActivate = useCallback(async () => {
    if (!isManager) {
      toast({ title: "Permission Denied", variant: "destructive" });
      return;
    }

    try {
      await Promise.all(
        selectedResidents.map((id) =>
          axiosClient.post(`/manager/residents/${id}/status`, {
            status: "active",
          })
        )
      );
      setResidents((prev) =>
        prev.map((r) =>
          selectedResidents.includes(r.id) ? { ...r, status: "active" } : r
        )
      );
      toast({
        title: "Bulk Activate",
        description: `${selectedResidents.length} residents activated.`,
      });
      setSelectedResidents([]);
    } catch (err) {
      console.error("Bulk activate error:", err);
      toast({
        title: "Error",
        description: "Could not activate selection.",
        variant: "destructive",
      });
    }
  }, [isManager, selectedResidents, toast]);

  const handleBulkDelete = useCallback(async () => {
    if (!isManager) {
      toast({ title: "Permission Denied", variant: "destructive" });
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to remove ${selectedResidents.length} selected residents?`
      )
    ) {
      return;
    }

    try {
      await Promise.all(
        selectedResidents.map((id) =>
          axiosClient.delete(`/manager/residents/${id}`)
        )
      );
      setResidents((prev) =>
        prev.filter((r) => !selectedResidents.includes(r.id))
      );
      toast({
        title: "Bulk Delete",
        description: `${selectedResidents.length} residents removed.`,
        variant: "destructive",
      });
      setSelectedResidents([]);
    } catch (err) {
      console.error("Bulk delete error:", err);
      toast({
        title: "Error",
        description: "Could not delete selection.",
        variant: "destructive",
      });
    }
  }, [isManager, selectedResidents, toast]);

  // =============================
  // 📌 Actual Send Invitation (فعلاً Simulation + Save)
  // =============================
  const handleActualSendInvitation = useCallback(() => {
    setIsSubmitting(true);
    setTimeout(() => {
      try {
        if (!residentFormData.email || !residentFormData.referralCode) {
          toast({
            title: "Error",
            description:
              "Cannot send invitation. Missing email or referral code.",
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Invitation Sent (Simulated)",
          description: `Invitation with code ${residentFormData.referralCode} sent to ${residentFormData.email}.`,
        });
        setIsInvitationPreviewOpen(false);
      } catch (error) {
        toast({
          title: "Error Sending",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }, 500);
  }, [residentFormData, toast]);

  return {
    residents,
    setResidents,
    buildingUnits,
    buildingDetails,
    isFormDialogOpen,
    setIsFormDialogOpen,
    editingResident,
    setEditingResident,
    viewingMembersForResident,
    isViewMembersDialogOpen,
    setIsViewMembersDialogOpen,
    isInvitationPreviewOpen,
    setIsInvitationPreviewOpen,
    residentFormData,
    setResidentFormData,
    selectedResidents,
    setSelectedResidents,
    isManager,
    isSubmitting,
    loadingInitial,

    resetForm,
    handleInputChange,
    handleUnitSelection,
    handlePreviewInvitation,
    handleSubmitResident,
    handleEditResident,
    handleDeleteResident,
    handleResendInvitation,
    handleResetPasscode,
    handleSendReminder,
    handleToggleDeactivate,
    handleViewAccessHistory,
    handleViewMembers,
    availableUnits,
    handleSelectResident,
    handleBulkInvite,
    handleBulkAssignGroup,
    handleBulkExportCSV,
    handleBulkExportPDF,
    handleBulkDeactivate,
    handleBulkActivate,
    handleBulkDelete,
    handleActualSendInvitation,
  };
};
