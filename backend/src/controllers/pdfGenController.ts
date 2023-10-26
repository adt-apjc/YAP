import { NextFunction, Request, Response } from "express";
import { mdToPdf } from "md-to-pdf";
import { catchErrorAsync } from "../libs/errorHandler";
import { config } from "../ConfigType";
import fs from "fs";
// import logger from "../libs/logger";

const PAGE_BRAKE = "<div class='page-break'></div>";
// prettier-ignore
const PDF_CONFIG = 
`---
# Github style Markdown
stylesheet: https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/2.10.0/github-markdown.min.css
body_class: markdown-body
css: |-
   .page-break { page-break-after: always; }
   .markdown-body { font-size: 12px; font-family: sans-serif; }
   .markdown-body pre > code { white-space: pre-wrap; }
pdf_options:
   format: a4
   margin: 20mm 20mm
   printBackground: true
---

`;

function generatePreface(config: config) {
   let prefaceMD = "";
   for (let i = 0; i < config.preface.length; i++) {
      prefaceMD += config.preface[i].bodyMarkdown + "\n\n";
   }
   return prefaceMD + "\n" + PAGE_BRAKE + "\n\n";
}

function generateEndpointInfo(config: config) {
   /* format
   ### Endpoints
   **NAME**
   - baseURL : `...`

   #### Headers
   | Key | value |
   | --- | --- |
   | ... | ... |
   | ... | ... |
   */

   let endpointInfoMD = "### Endpoints \nThis page summarize all the endpoints used in this document. \n\n";
   for (let endpoint of Object.keys(config.endpoints)) {
      endpointInfoMD += `**${endpoint}**  \n`;
      endpointInfoMD += `- baseURL : \`${config.endpoints[endpoint].baseURL}\`\n\n`;
      endpointInfoMD += "#### Headers\n";
      endpointInfoMD += "| Key | value |\n";
      endpointInfoMD += "| --- | --- |\n";
      for (let header of Object.keys(config.endpoints[endpoint].headers)) {
         endpointInfoMD += `| ${header} | ${config.endpoints[endpoint].headers[header]} |\n`;
      }
      endpointInfoMD += "\n";
   }

   return endpointInfoMD + "\n" + PAGE_BRAKE + "\n\n";
}

function generateStepAPIinfo(config: config) {
   let stepAPIinfoMD = "";
   for (let step of config.sidebar) {
      if (["stage", "unstage", "cleanup"].includes(step.name)) continue;

      stepAPIinfoMD += `## ${step.label}\n\n`; // step name
      stepAPIinfoMD += `${config.mainContent[step.name].description}\n\n`; // step description
      for (let stepAction of ["preCheck", "actions", "postCheck"] as const) {
         if (config.mainContent[step.name][stepAction].length > 0) {
            stepAPIinfoMD += `### ${stepAction}\n\n`;
            for (let action of config.mainContent[step.name][stepAction]) {
               stepAPIinfoMD += "#### " + action.title + "\n";
               if (action.description) stepAPIinfoMD += `${action.description}\n`;
               stepAPIinfoMD += "\n";
               stepAPIinfoMD += `**API Endpoint** : \`${action.useEndpoint}\` **Method** : \`${action.method.toLocaleUpperCase}\`  \n`;
               stepAPIinfoMD += `**Path** : \`${action.url}\`  \n`;
               if (action.data)
                  if (typeof action.data === "object" && Object.keys(action.data).length > 0)
                     stepAPIinfoMD += `**Payload** : \n\`\`\`json\n${JSON.stringify(action.data, null, 3)}\n\`\`\`  \n\n`;
                  else if (typeof action.data === "string") stepAPIinfoMD += `**Payload** : \`${action.data}\`  \n\n`;
            }
         }
      }
   }
   return stepAPIinfoMD + "\n";
}

export const pdfGenController = catchErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
   const config: config = req.body;

   let prefaceContent = generatePreface(config);
   let endpointInfoContent = generateEndpointInfo(config);
   let stepAPIContent = generateStepAPIinfo(config);
   let content = PDF_CONFIG + prefaceContent + endpointInfoContent + stepAPIContent;
   fs.writeFileSync("test.md", content);
   let pdf = await mdToPdf({ content: content }).catch(console.error);
   if (pdf) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=generatedPDF.pdf");
      res.send(pdf.content);
   } else {
      res.status(500).send("Error while generating PDF.");
   }
});
