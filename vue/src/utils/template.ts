export const generateDocContent = (pageTitle: string, docUrl: string) => {
  return `<!DOCTYPE html>
<html>
<head>
   <title>${pageTitle}</title>
   <meta http-equiv="refresh" content="0; URL='${docUrl}'" />
</head>
<body>
   <p>If you do not redirect please visit: ${docUrl}</p>
</body>
</html>`
}
