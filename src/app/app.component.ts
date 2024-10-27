import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as pdfjsLib from 'pdfjs-dist';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'filez';

  constructor() {
    // pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdfjs/pdf.worker.min.mjs';
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.7.76/pdf.worker.min.mjs";
  }

  @ViewChild('pdfContainer', { static: true }) pdfContainer!: ElementRef<HTMLDivElement>;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileReader = new FileReader();

      fileReader.onload = (e) => {
        const pdfData = new Uint8Array(e.target?.result as ArrayBuffer);
        this.loadPdf(pdfData);
      };

      fileReader.readAsArrayBuffer(file);
    }
  }

  async loadPdf(data: Uint8Array) {
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const numPages = pdf.numPages;

    // Clear previous content
    this.pdfContainer.nativeElement.innerHTML = '';

    // Render each page
    for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      const viewport = page.getViewport({ scale: 1.5 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = { canvasContext: context!, viewport };
      await page.render(renderContext).promise;

      // Append the canvas to the container
      this.pdfContainer.nativeElement.appendChild(canvas);
    }
  }

}
