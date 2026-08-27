import { config } from '../../config';
import { useAuthStore } from '../../store/authStore';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(path, options = {}) {
    const url =
      `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

    const {
      user,
      token,
    } = useAuthStore.getState();

    const isFormData =
      typeof FormData !== 'undefined' &&
      options.body instanceof FormData;

    const headers = {
      ...(options.headers || {}),
    };

    /*
     * Never manually set Content-Type for FormData.
     */
    if (!isFormData) {
      headers['Content-Type'] =
        'application/json';
    }

    /*
     * Development user identification.
     */
    if (user?.email) {
      headers['X-Dev-User-Email'] =
        user.email;
    }

    /*
     * JWT authentication.
     */
    if (token) {
      headers['Authorization'] =
        `Bearer ${token}`;
    }

    const fetchOptions = {
      ...options,
      headers,
    };

    /*
     * Convert normal JavaScript objects
     * into JSON.
     */
    if (
      options.body &&
      typeof options.body === 'object' &&
      !isFormData
    ) {
      fetchOptions.body =
        JSON.stringify(options.body);
    }

    try {
      const response =
        await fetch(
          url,
          fetchOptions
        );

      /*
       * Authentication failure.
       */
      if (
        response.status === 401 &&
        path !== '/auth/login'
      ) {
        useAuthStore
          .getState()
          .logout();

        if (
          window.location.pathname !==
          '/login'
        ) {
          window.location.href =
            '/login';
        }

        return null;
      }

      /*
       * No content.
       */
      if (response.status === 204) {
        return null;
      }

      /*
       * Read response.
       */
      const contentType =
        response.headers.get(
          'content-type'
        ) || '';

      let data;

      if (
        contentType.includes(
          'application/json'
        )
      ) {
        data =
          await response.json();
      } else {
        data =
          await response.text();
      }

      /*
       * API error.
       */
      if (!response.ok) {
        let message =
          'API Request failed';

        if (
          typeof data === 'object' &&
          data?.detail
        ) {
          message =
            typeof data.detail ===
            'string'
              ? data.detail
              : JSON.stringify(
                  data.detail
                );
        } else if (
          typeof data === 'string' &&
          data.trim()
        ) {
          message = data;
        } else if (
          response.statusText
        ) {
          message =
            response.statusText;
        }

        const error =
          new Error(message);

        error.status =
          response.status;

        error.data = data;

        throw error;
      }

      return data;
    } catch (error) {
      console.error(
        `API Error [${options.method || 'GET'} ${path}]:`,
        error
      );

      throw error;
    }
  }

  async download(path) {
    const url =
      `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

    const {
      user,
      token,
    } = useAuthStore.getState();

    const headers = {};

    if (user?.email) {
      headers['X-Dev-User-Email'] =
        user.email;
    }

    if (token) {
      headers['Authorization'] =
        `Bearer ${token}`;
    }

    const response =
      await fetch(url, {
        method: 'GET',
        headers,
      });

    if (
      response.status === 401 &&
      path !== '/auth/login'
    ) {
      useAuthStore
        .getState()
        .logout();

      if (
        window.location.pathname !==
        '/login'
      ) {
        window.location.href =
          '/login';
      }

      return null;
    }

    if (!response.ok) {
      let message =
        'Download failed';

      try {
        const contentType =
          response.headers.get(
            'content-type'
          ) || '';

        if (
          contentType.includes(
            'application/json'
          )
        ) {
          const data =
            await response.json();

          if (
            typeof data?.detail ===
            'string'
          ) {
            message =
              data.detail;
          } else if (
            data?.detail
          ) {
            message =
              JSON.stringify(
                data.detail
              );
          }
        } else {
          const text =
            await response.text();

          if (text.trim()) {
            message = text;
          }
        }
      } catch {
        // Keep default error.
      }

      const error =
        new Error(message);

      error.status =
        response.status;

      throw error;
    }

    const blob =
      await response.blob();

    const disposition =
      response.headers.get(
        'content-disposition'
      ) || '';

    let filename =
      'attachment';

    const filenameMatch =
      disposition.match(
        /filename\*=UTF-8''([^;]+)|filename="([^"]+)"|filename=([^;]+)/i
      );

    if (filenameMatch) {
      filename =
        filenameMatch[1] ||
        filenameMatch[2] ||
        filenameMatch[3] ||
        filename;

      try {
        filename =
          decodeURIComponent(
            filename
          );
      } catch {
        // Keep original filename.
      }
    }

    const blobUrl =
      window.URL.createObjectURL(
        blob
      );

    const link =
      document.createElement('a');

    link.href = blobUrl;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(
      blobUrl
    );

    return true;
  }

  get(path, options = {}) {
    return this.request(
      path,
      {
        ...options,
        method: 'GET',
      }
    );
  }

  post(
    path,
    body,
    options = {}
  ) {
    return this.request(
      path,
      {
        ...options,
        method: 'POST',
        body,
      }
    );
  }

  patch(
    path,
    body,
    options = {}
  ) {
    return this.request(
      path,
      {
        ...options,
        method: 'PATCH',
        body,
      }
    );
  }

  put(
    path,
    body,
    options = {}
  ) {
    return this.request(
      path,
      {
        ...options,
        method: 'PUT',
        body,
      }
    );
  }

  delete(
    path,
    options = {}
  ) {
    return this.request(
      path,
      {
        ...options,
        method: 'DELETE',
      }
    );
  }
}

export const apiClient =
  new ApiClient(
    config.api.baseUrl
  );