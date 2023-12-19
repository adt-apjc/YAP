### YAP Configuration JSON Release Notes

The document summarises the release notes for the YAP JSON configuration file

**Rel. 1.0.0**

-  Initial Relase

**Rel. 1.0.1**

-  Added "payloadType" field to support "text" or "json" request payloads. Exposed "headers" field for overriding endpoint headers.

**Rel. 1.0.2**

-  Boolean clearVariables field added to cleanup section to control the default of the Clear Variables checkbox in the Clean Up view. The default is to check (true) this field.

**Rel. 1.0.3**

Release 1.0.3 adds support for the SSH action type to the REST type supported from the initial release. These SSH actions use the new sshCliEndpoints object as a target. You can also use the same SSH endpoints for the SSH object in the outcome diagram.
Release 1.0.3 is the default release starting from YAP version 1.1.0. You can import a 1.0.2 release in YAP 1.1.0 and export it as 1.0.3 without compatibility issues.
