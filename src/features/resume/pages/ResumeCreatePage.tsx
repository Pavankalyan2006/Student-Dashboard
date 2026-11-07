import React, { useEffect, useRef, useState } from 'react';
import { resumeApi } from '../api/resumeApi';
import { LoadingState, ErrorState } from '../../../components/layout/PageComponents';

/** /resume/create: creates a new, empty resume for the signed-in student and opens it in the editor. */
export const ResumeCreatePage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    resumeApi
      .createResume({ title: 'New resume' })
      .then((created) => {
        // Replace /resume/create in history so Back does not create another resume.
        window.history.replaceState({}, '', '/resume');
        onNavigate(`/resume/${created.resume.id}/edit`);
      })
      .catch((err: any) => setError(err?.message || 'Could not create a resume.'));
  }, [onNavigate]);
  if (error) return <ErrorState message={error} />;
  return <LoadingState message="Creating your resume..." />;
};
