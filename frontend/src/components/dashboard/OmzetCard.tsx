import React from 'react';
import { formatNumber } from '../../utils/formatters';
import { Plus, CreditCard, ChevronRight } from 'lucide-react';

interface OmzetCardProps {
  totalOmzet: number;
}

export function OmzetCard({ totalOmzet }: OmzetCardProps) {
  return (
    <div className="bg-[#111827] rounded-3xl p-6 text-white relative overflow-hidden shadow-xl mb-6 border border-[#1f2937]">
      {/* Background glowing orbs */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-primary opacity-20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent-secondary opacity-10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col h-full justify-center">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">Total Omzet</p>
            <h2 className="text-3xl font-extrabold tracking-tight">Rp {formatNumber(totalOmzet)}</h2>
          </div>
          <div className="bg-white/10 p-2 rounded-full backdrop-blur-md border border-white/10">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
