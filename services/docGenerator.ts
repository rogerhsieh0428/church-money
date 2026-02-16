
import { Document, Packer, Paragraph, Table, TableRow, TableCell, AlignmentType, HeadingLevel, WidthType, BorderStyle, TextRun } from 'docx';
import FileSaver from 'file-saver';
import { DonationRecord, ChurchInfo } from '../types';

export const generateDonorReceipt = async (donorName: string, records: DonationRecord[], churchInfo: ChurchInfo) => {
  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: churchInfo.name,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: "奉 獻 收 據",
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `奉獻編號：${records[0]?.donorCode || "N/A"}`, bold: true }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `奉獻姓名：${donorName}`, bold: true }),
          ],
          spacing: { after: 200 },
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "奉獻日期", alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ text: "奉獻類別", alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ text: "奉獻金額", alignment: AlignmentType.CENTER })] }),
              ],
            }),
            ...records.map(r => new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: r.date, alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ text: r.category, alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ text: r.amount.toLocaleString(), alignment: AlignmentType.RIGHT })] }),
              ],
            })),
            new TableRow({
              children: [
                new TableCell({ columnSpan: 2, children: [new Paragraph({ text: "奉 獻 合 計", alignment: AlignmentType.CENTER, bold: true })] }),
                new TableCell({ children: [new Paragraph({ text: totalAmount.toLocaleString(), alignment: AlignmentType.RIGHT, bold: true })] }),
              ],
            }),
          ],
        }),
        new Paragraph({ text: "", spacing: { before: 400 } }),
        new Paragraph({ text: "========================================================================" }),
        new Paragraph({ text: `統一編號：${churchInfo.taxId}` }),
        new Paragraph({ text: `地 址：${churchInfo.address}` }),
        new Paragraph({
          children: [
            new TextRun(`電 話：${churchInfo.phone}     `),
            new TextRun(`經手人：${churchInfo.handler}`),
          ],
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  // Use FileSaver.saveAs instead of direct saveAs to handle module export differences
  FileSaver.saveAs(blob, `${donorName}_2025年度奉獻收據.docx`);
};
