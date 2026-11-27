import * as React from 'react';
import { NexoraMark } from '../brand/Nexora';

/** The platform mark. Kept as an alias of the NEXORA AI tile so existing imports keep working. */
export function BrandMark({ className }: { className?: string }) {
  return <NexoraMark className={className} />;
}
