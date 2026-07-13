const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export interface DateInfo {
  formatted: string;   // DD/MM/YYYY
  year: number;
  monthName: string;   // Bahasa Indonesia
  monthNumber: number;
  dateObj: Date;
}

export class DateResolver {
  format(input: string | Date | number | null | undefined): DateInfo {
    if (!input) {
      throw new Error('Date is required');
    }

    let date: Date;

    if (input instanceof Date) {
      date = input;
    } else if (typeof input === 'number') {
      // Excel serial number
      date = this.excelSerialToDate(input);
    } else if (typeof input === 'string') {
      date = new Date(input);
    } else {
      throw new Error(`Invalid date format: ${input}`);
    }

    if (isNaN(date.getTime())) {
      throw new Error(`Cannot parse date: ${input}`);
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return {
      formatted: `${day}/${month}/${year}`,
      year,
      monthName: MONTH_NAMES_ID[date.getMonth()],
      monthNumber: date.getMonth() + 1,
      dateObj: date,
    };
  }

  private excelSerialToDate(serial: number): Date {
    const utcDays = Math.floor(serial - 25569);
    return new Date(utcDays * 86400 * 1000);
  }
}
