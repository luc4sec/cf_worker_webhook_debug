export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    const requestInfo = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      pathname: url.pathname,
      origin: url.origin,
      protocol: url.protocol,
      host: url.host,
      hostname: url.hostname,
      port: url.port || 'default',
    };

    const queryParams = {};
    url.searchParams.forEach((value, key) => {
      if (queryParams[key]) {
        if (Array.isArray(queryParams[key])) {
          queryParams[key].push(value);
        } else {
          queryParams[key] = [queryParams[key], value];
        }
      } else {
        queryParams[key] = value;
      }
    });

    const headers = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const cfProperties = request.cf ? { ...request.cf } : null;

    let body = null;
    let bodyType = 'none';
    let formData = null;
    let jsonBody = null;
    let textBody = null;
    let binaryInfo = null;

    const contentType = request.headers.get('content-type') || '';

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        const clonedRequest = request.clone();
        const clonedRequest2 = request.clone();
        const clonedRequest3 = request.clone();

        if (contentType.includes('application/json')) {
          try {
            jsonBody = await clonedRequest.json();
            bodyType = 'json';
          } catch (e) {
            bodyType = 'invalid-json';
          }
        }
        
        if (contentType.includes('multipart/form-data')) {
          try {
            const fd = await clonedRequest2.formData();
            formData = {};
            for (const [key, value] of fd.entries()) {
              if (value instanceof File) {
                formData[key] = {
                  type: 'file',
                  name: value.name,
                  size: value.size,
                  mimeType: value.type,
                };
              } else {
                formData[key] = value;
              }
            }
            bodyType = 'multipart-form';
          } catch (e) {}
        }

        if (contentType.includes('application/x-www-form-urlencoded')) {
          try {
            const fd = await clonedRequest2.formData();
            formData = {};
            for (const [key, value] of fd.entries()) {
              formData[key] = value;
            }
            bodyType = 'urlencoded-form';
          } catch (e) {}
        }

        try {
          textBody = await clonedRequest3.text();
          if (!bodyType || bodyType === 'none') {
            bodyType = textBody ? 'text' : 'empty';
          }
        } catch (e) {}

      } catch (e) {
        body = { error: 'Could not parse body', message: e.message };
      }
    }

    const response = {
      request: requestInfo,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : null,
      headers: headers,
      cloudflare: cfProperties,
      body: {
        type: bodyType,
        contentType: contentType || null,
        json: jsonBody,
        form: formData,
        text: textBody,
        raw: body,
      },
    };

    const cleanResponse = JSON.parse(JSON.stringify(response, (key, value) => {
      if (value === null || value === undefined) return undefined;
      if (typeof value === 'object' && Object.keys(value).length === 0) return undefined;
      return value;
    }));

    return new Response(JSON.stringify(cleanResponse, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    });
  },
};
