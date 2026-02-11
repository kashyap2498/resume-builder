// =============================================================================
// Resume Builder - Certifications Editor
// =============================================================================

import { Plus, Award } from 'lucide-react';
import { useResumeStore } from '@/store/resumeStore';
import { Input, Button, EmptyState, MonthYearPicker } from '@/components/ui';
import { EntryCard } from './EntryCard';

export function CertificationsEditor() {
  const certifications =
    useResumeStore((s) => s.currentResume?.data.certifications) ?? [];
  const addCertification = useResumeStore((s) => s.addCertification);
  const updateCertification = useResumeStore((s) => s.updateCertification);
  const removeCertification = useResumeStore((s) => s.removeCertification);

  const handleAdd = () => {
    addCertification({
      name: '',
      issuer: '',
      date: '',
      expiryDate: '',
      credentialId: '',
      url: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Certifications
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            List your professional certifications and credentials.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={handleAdd}
        >
          Add
        </Button>
      </div>

      {certifications.length === 0 ? (
        <EmptyState
          icon={<Award className="h-6 w-6" />}
          title="No certifications added"
          description="Add certifications to validate your expertise."
          action={{
            label: 'Add Certification',
            onClick: handleAdd,
            icon: <Plus className="h-4 w-4" />,
          }}
        />
      ) : (
        <div className="space-y-3">
          {certifications.map((entry) => (
            <EntryCard
              key={entry.id}
              title={entry.name || 'New Certification'}
              subtitle={entry.issuer || undefined}
              onDelete={() => removeCertification(entry.id)}
            >
              <div className="space-y-4">
                {/* Name & Issuer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Certification Name"
                    placeholder="AWS Solutions Architect"
                    value={entry.name}
                    onChange={(e) =>
                      updateCertification(entry.id, { name: e.target.value })
                    }
                  />
                  <Input
                    label="Issuing Organization"
                    placeholder="Amazon Web Services"
                    value={entry.issuer}
                    onChange={(e) =>
                      updateCertification(entry.id, { issuer: e.target.value })
                    }
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MonthYearPicker
                    label="Date Issued"
                    value={entry.date}
                    onChange={(val) =>
                      updateCertification(entry.id, { date: val })
                    }
                  />
                  <MonthYearPicker
                    label="Expiry Date"
                    value={entry.expiryDate}
                    onChange={(val) =>
                      updateCertification(entry.id, { expiryDate: val })
                    }
                    hint="Leave blank if it does not expire"
                  />
                </div>

                {/* Credential ID & URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Credential ID"
                    placeholder="ABC-123-XYZ"
                    value={entry.credentialId}
                    onChange={(e) =>
                      updateCertification(entry.id, {
                        credentialId: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="Credential URL"
                    placeholder="https://verify.example.com/cert/123"
                    value={entry.url}
                    onChange={(e) =>
                      updateCertification(entry.id, { url: e.target.value })
                    }
                  />
                </div>
              </div>
            </EntryCard>
          ))}
        </div>
      )}
    </div>
  );
}
