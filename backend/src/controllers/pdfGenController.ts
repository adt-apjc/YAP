import { NextFunction, Request, Response } from "express";
import { mdToPdf } from "md-to-pdf";
import { catchErrorAsync } from "../libs/errorHandler";
import { ApiResponseData, config } from "../ConfigType";
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

function generateAPIResponse(
   actionType: "preCheck" | "actions" | "postCheck",
   responseData: ApiResponseData,
   stepName: string,
   i: number,
) {
   if (!responseData) return "";
   type PathMap = { [k: string]: keyof typeof responseData };

   let typeToObjPathMap: PathMap = { preCheck: "preCheckResults", actions: "actionResults", postCheck: "postCheckResults" };
   let responseMD = "";
   let resp = responseData[typeToObjPathMap[actionType]][stepName]?.[i];
   let data = resp?.data;
   let statusCode = `${resp?.status} ${resp?.statusText}`;
   if (!data) return "";

   if (typeof data === "object") {
      responseMD += `**Response** : \`${statusCode}\` \n\`\`\`json\n${JSON.stringify(data, null, 3)}\n\`\`\`  \n\n`;
   } else if (typeof data === "string") {
      responseMD += `**Response** : \`${statusCode}\` \n\`\`\`\n${data}\n\`\`\`  \n\n`;
   }

   return responseMD;
}

function generateStepAPIinfo(config: config, responseData: ApiResponseData) {
   let stepTitleMap = { preCheck: "Pre-Check", actions: "Actions", postCheck: "Post-Check" };
   let stepAPIinfoMD = "# API Information\n\n";
   for (let [i, step] of config.sidebar.entries()) {
      if (["stage", "unstage", "cleanup"].includes(step.name)) continue;

      stepAPIinfoMD += `## ${i + 1}. ${step.label}\n\n`; // step name
      stepAPIinfoMD += `${config.mainContent[step.name].description}\n\n`; // step description
      for (let actionType of ["preCheck", "actions", "postCheck"] as const) {
         if (config.mainContent[step.name][actionType].length > 0) {
            stepAPIinfoMD += `### ${stepTitleMap[actionType]}\n\n`;
            for (let [i, action] of config.mainContent[step.name][actionType].entries()) {
               stepAPIinfoMD += "#### " + action.title + "\n";
               if (action.description) stepAPIinfoMD += `${action.description}\n`;
               stepAPIinfoMD += "\n";
               stepAPIinfoMD += `**API Endpoint** : \`${action.useEndpoint}\` **Method** : \`${action.method.toLocaleUpperCase()}\`  \n`; // prettier-ignore
               stepAPIinfoMD += `**Path** : \`${action.url}\`  \n`;
               if (action.data) {
                  if (typeof action.data === "object" && Object.keys(action.data).length > 0)
                     stepAPIinfoMD += `**Payload** : \n\`\`\`json\n${JSON.stringify(action.data, null, 3)}\n\`\`\`  \n\n`;
                  else if (typeof action.data === "string") stepAPIinfoMD += `**Payload** : \`${action.data}\`  \n\n`;
               }
               stepAPIinfoMD += generateAPIResponse(actionType, responseData, step.name, i);
            }
         }
      }
   }
   return stepAPIinfoMD + "\n";
}

export const pdfGenController = catchErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
   const config: config = req.body.config;
   const responseData: ApiResponseData = req.body.responseData;

   let prefaceContent = generatePreface(config);
   let endpointInfoContent = generateEndpointInfo(config);
   let stepAPIContent = generateStepAPIinfo(config, responseData);
   let content = PDF_CONFIG + prefaceContent + endpointInfoContent + stepAPIContent;
   fs.writeFileSync("test.md", content);
   let pdf = await mdToPdf({ content: content }, { launch_options: { args: ["--no-sandbox"] } }).catch(console.error);
   if (pdf) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=generatedPDF.pdf");
      res.send(pdf.content);
   } else {
      res.status(500).send("Error while generating PDF.");
   }
});
