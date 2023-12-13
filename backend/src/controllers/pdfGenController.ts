import { NextFunction, Request, Response } from "express";
import { mdToPdf } from "md-to-pdf";
import { catchErrorAsync } from "../libs/errorHandler";
import { ResponseData, RestAPIResponseData, SSHCliResponseData, config } from "../ConfigType";

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

function generateAPIEndpointInfo(config: config) {
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

   let endpointInfoMD = "### API Endpoints \nThis page summarizes all the REST API endpoints used in this document. \n\n";
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

function generateSSHEndpointInfo(config: config) {
   if (config.sshCliEndpoints) {
      let endpointInfoMD = "### SSH Endpoints \nThis page summarize all the SSH endpoints used in this document. \n\n";
      console.log(config.sshCliEndpoints);
      for (let endpoint of Object.keys(config.sshCliEndpoints)) {
         endpointInfoMD += `**${endpoint}**  \n`;
         endpointInfoMD += `- Device Type : \`${config.sshCliEndpoints[endpoint].deviceType}\`\n\n`;
         endpointInfoMD += `- Hostname : \`${config.sshCliEndpoints[endpoint].hostname}\`\n\n`;
         endpointInfoMD += `- TCP Port : \`${config.sshCliEndpoints[endpoint].port}\`\n\n`;
         endpointInfoMD += `- Username : \`${config.sshCliEndpoints[endpoint].username}\`\n\n`;
         endpointInfoMD += `- Prompt Regex : \`${config.sshCliEndpoints[endpoint].promptRegex}\`\n\n`;
         endpointInfoMD += "\n\n";
      }

      return endpointInfoMD + "\n" + PAGE_BRAKE + "\n\n";
   } else {
      return "";
   }
}

function generateAPIResponse(
   actionType: "preCheck" | "actions" | "postCheck",
   responseData: RestAPIResponseData,
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

function generateSSHResponse(
   actionType: "preCheck" | "actions" | "postCheck",
   responseData: SSHCliResponseData,
   stepName: string,
   i: number,
) {
   if (!responseData) return "";
   type PathMap = { [k: string]: keyof typeof responseData };
   type SSHCLIResponse = { response: string; success: boolean; failureCause?: string };

   let typeToObjPathMap: PathMap = { preCheck: "preCheckResults", actions: "actionResults", postCheck: "postCheckResults" };
   let responseMD = "";

   let resp: SSHCLIResponse = responseData[typeToObjPathMap[actionType]][stepName]?.[i];
   if (!resp) return "";
   let data = resp?.response;
   responseMD += `**Response** : \n\`\`\`\n${data.replace(/\[[0-9;]*m/g, "")}\n\`\`\`  \n\n`;
   return responseMD;
}

function generateStepinfo(config: config, responseData: ResponseData) {
   let stepTitleMap = { preCheck: "Pre-Check", actions: "Actions", postCheck: "Post-Check" };
   let stepInfoMD = "# Workflow Information\n\n";
   for (let [i, step] of config.sidebar.entries()) {
      if (["stage", "unstage", "cleanup"].includes(step.name)) continue;

      stepInfoMD += `## ${i + 1}. ${step.label}\n\n`; // step name
      stepInfoMD += `${config.mainContent[step.name].description}\n\n`; // step description
      for (let actionType of ["preCheck", "actions", "postCheck"] as const) {
         if (config.mainContent[step.name][actionType].length > 0) {
            stepInfoMD += `### ${stepTitleMap[actionType]}\n\n`;
            for (let [i, action] of config.mainContent[step.name][actionType].entries()) {
               if (action.type === "request" || action.type === "polling") {
                  stepInfoMD += `#### ${i + 1} -  ${action.title}\n`;
                  if (action.description) stepInfoMD += `${action.description}\n`;
                  stepInfoMD += "\n";
                  stepInfoMD += `**API Endpoint** : \`${action.useEndpoint}\` **Method** : \`${action.method.toLocaleUpperCase()}\`  \n`; // prettier-ignore
                  stepInfoMD += `**Path** : \`${action.url}\`  \n`;
                  if (action.data) {
                     if (typeof action.data === "object" && Object.keys(action.data).length > 0)
                        stepInfoMD += `**Payload** : \n\`\`\`json\n${JSON.stringify(action.data, null, 3)}\n\`\`\`  \n\n`;
                     else if (typeof action.data === "string") stepInfoMD += `**Payload** : \`${action.data}\`  \n\n`;
                  }
                  stepInfoMD += generateAPIResponse(actionType, responseData as RestAPIResponseData, step.name, i);
               } else if (action.type === "ssh-cli") {
                  stepInfoMD += `#### ${i + 1} -  ${action.title}\n`;
                  if (action.description) stepInfoMD += `${action.description}\n`;
                  stepInfoMD += "\n";
                  stepInfoMD += `**SSH Endpoint** : \`${action.useEndpoint}\` **Timeout** : \`${action.sessionTimeout}\`  \n`; // prettier-ignore

                  stepInfoMD += `**List of Instructions:**  \n\`\`\`\n${action.data}\n\`\`\`  \n\n`;
                  stepInfoMD += generateSSHResponse(actionType, responseData as SSHCliResponseData, step.name, i);
               }
            }
         }
      }
   }
   return stepInfoMD + "\n";
}

export const pdfGenController = catchErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
   const config: config = req.body.config;
   const responseData: ResponseData = req.body.responseData;

   let prefaceContent = generatePreface(config);
   let endpointInfoContent = generateAPIEndpointInfo(config);
   let SSHendpointInfoContent = generateSSHEndpointInfo(config);

   let stepAPIContent = generateStepinfo(config, responseData);
   let content = PDF_CONFIG + prefaceContent + endpointInfoContent + SSHendpointInfoContent + stepAPIContent;
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
