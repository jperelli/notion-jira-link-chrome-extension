chrome.runtime.onMessage.addListener(
  ({ query, id } = {}, sender, sendResponse) => {
    // const jiraUrl = "celerative.atlassian.net";

    // https://docs.atlassian.com/software/jira/docs/api/REST/8.18.1/#api/2/issue-getIssue
    // const fields = '' // this returns all fields
    const fields = "?fields=summary,status,issuetype,assignee";

    chrome.storage.local.get(["url"], async ({ url: jiraUrl }) => {
      let url =
        query == "getSession"
          ? `https://${jiraUrl}/rest/auth/1/session`
          : `https://${jiraUrl}/rest/api/2/issue/${id}${fields}`;
      console.log(url);
      const response = await fetch(url, {
        headers: { accept: "application/json" },
      });
      sendResponse(await response.json());
    });
    return true;
  }
);
