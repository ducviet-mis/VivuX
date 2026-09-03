import { redirect } from 'next/navigation';

export default function ManagePage({ params }: { params: { classId: string } }) {
  redirect(`/teacher/${params.classId}`);
}