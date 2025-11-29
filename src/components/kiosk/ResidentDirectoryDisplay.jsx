import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, ArrowUpDown, UserCircle2, PhoneOutgoing, BellOff } from 'lucide-react';

const ResidentDirectoryDisplay = ({ residents, onSelectResident, searchTerm, setSearchTerm, sortBy, sortOrder, handleSort, t, resetIdleTimerKiosk }) => {
  return (
    <Card className="md:col-span-2 bg-black/30 backdrop-blur-sm border-white/10 shadow-2xl overflow-hidden flex flex-col">
      <CardHeader className="border-b border-white/10 p-2 md:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 md:mb-3 gap-2">
          <CardTitle className="text-xl md:text-2xl font-semibold">{t('residentDirectory')}</CardTitle>
          <div className="flex space-x-1 md:space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleSort('unit')} className="text-xs md:text-sm bg-transparent hover:bg-white/10 border-white/30 text-white px-2 py-1 md:px-3 md:py-1.5">
              {t('sortByUnit')} <ArrowUpDown className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleSort('name')} className="text-xs md:text-sm bg-transparent hover:bg-white/10 border-white/30 text-white px-2 py-1 md:px-3 md:py-1.5">
              {t('sortByName')} <ArrowUpDown className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Input
            type="text"
            placeholder={t('searchByNameUnit')}
            value={searchTerm}
            onChange={(e) => { resetIdleTimerKiosk(); setSearchTerm(e.target.value); }}
            className="w-full p-2 md:p-3 text-base md:text-lg bg-white/5 border-white/20 placeholder-white/50 focus:border-purple-400 focus:ring-purple-400"
          />
          <Search className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-white/50" />
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto max-h-[calc(100vh-380px)] md:max-h-[calc(100vh-420px)]">
        {residents.length > 0 ? (
          <ul className="divide-y divide-white/10">
            {residents.map(resident => (
              <motion.li
                key={resident.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-2 md:p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors ${resident.currentlyDND && resident.dndSettings?.showDNDIcon ? 'opacity-70' : ''}`}
                onClick={() => onSelectResident(resident)}
              >
                <div className="flex items-center">
                  {resident.photoUrl ? (
                    <img-replace src={resident.photoUrl} alt={resident.kioskDisplayName || resident.fullName} className="w-10 h-10 md:w-12 md:h-12 rounded-full mr-2 md:mr-4 border-2 border-purple-500/50" />
                  ) : (
                    <UserCircle2 className="w-10 h-10 md:w-12 md:h-12 text-white/70 mr-2 md:mr-4" />
                  )}
                  <div>
                    <p className="text-base md:text-lg font-semibold flex items-center">
                      {resident.kioskDisplayName || resident.fullName}
                      {resident.currentlyDND && resident.dndSettings?.showDNDIcon && <BellOff className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2 text-yellow-400" />}
                    </p>
                    <p className="text-xs md:text-sm text-white/70">{t('unit')}: {resident.unitNumber} - {t('floor')}: {resident.floorNumber}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-purple-400 hover:text-purple-300" disabled={resident.currentlyDND && resident.dndSettings?.showDNDIcon}>
                  <PhoneOutgoing className="w-5 h-5 md:w-6 md:h-6" />
                </Button>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="p-4 md:p-8 text-center text-white/70 text-base md:text-lg">{t('noResidentsFound')}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ResidentDirectoryDisplay;