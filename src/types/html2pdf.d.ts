/**
 * Type declarations for html2pdf.js
 */

declare module "html2pdf.js" {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: {
      type?: "jpeg" | "png" | "webp";
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      letterRendering?: boolean;
      width?: number;
      height?: number;
    };
    jsPDF?: {
      unit?: "pt" | "mm" | "cm" | "in" | "px";
      format?: string | [number, number];
      orientation?: "portrait" | "landscape";
    };
    pagebreak?: {
      mode?: string[];
    };
  }

  interface Html2PdfInstance {
    set(options: Html2PdfOptions): Html2PdfInstance;
    from(element: HTMLElement | string): Html2PdfInstance;
    save(): Promise<void>;
    output(type: string): Promise<any>;
    outputPdf(
      type: "blob" | "datauristring" | "datauri" | "arraybuffer",
    ): Promise<any>;
    then(callback: (result: any) => void): Promise<any>;
  }

  function html2pdf(): Html2PdfInstance;
  function html2pdf(
    element: HTMLElement | string,
    options?: Html2PdfOptions,
  ): Html2PdfInstance;

  export = html2pdf;
}

declare module "html2pdf.js/dist/html2pdf.js" {
  export * from "html2pdf.js";
}

declare module "html2pdf.js/dist/html2pdf.min.js" {
  export * from "html2pdf.js";
}
