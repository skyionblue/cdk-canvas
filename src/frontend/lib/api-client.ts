import {CdkStack} from '../types';
import {SessionState} from '../types/session';

const API_BASE_URL = '/api';

/**
 * API client for CDK-Canvas backend.
 */
export class ApiClient {
  /**
   * Fetch list of available CDK stacks.
   */
  async listStacks(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/stacks`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stacks: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Fetch parsed CDK stack by name.
   *
   * @param stackName - Name of the stack
   */
  async getStack(stackName: string): Promise<CdkStack> {
    const response = await fetch(`${API_BASE_URL}/stacks/${stackName}`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch stack ${stackName}: ${response.statusText}`,
      );
    }
    return response.json();
  }

  /**
   * List saved diagram layouts.
   */
  async listLayouts(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/layouts`);
    if (!response.ok) {
      throw new Error(`Failed to fetch layouts: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get a saved diagram layout.
   *
   * @param layoutName - Name of the layout
   */
  async getLayout(layoutName: string): Promise<unknown> {
    const response = await fetch(`${API_BASE_URL}/layouts/${layoutName}`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch layout ${layoutName}: ${response.statusText}`,
      );
    }
    return response.json();
  }

  /**
   * Save a diagram layout.
   *
   * @param layoutName - Name of the layout
   * @param layout - Layout data to save
   */
  async saveLayout(layoutName: string, layout: unknown): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/layouts/${layoutName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(layout),
    });
    if (!response.ok) {
      throw new Error(
        `Failed to save layout ${layoutName}: ${response.statusText}`,
      );
    }
  }

  /**
   * Delete a saved layout.
   *
   * @param layoutName - Name of the layout
   */
  async deleteLayout(layoutName: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/layouts/${layoutName}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(
        `Failed to delete layout ${layoutName}: ${response.statusText}`,
      );
    }
  }

  /**
   * Save the current diagram session state to the server (held in memory until shutdown).
   */
  async saveSession(state: SessionState): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/session`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(state),
      });
    } catch {
      // Silently ignore — periodic saves are best-effort
    }
  }

  /**
   * Load a previously saved session from disk. Returns null if none exists.
   */
  async loadSession(): Promise<SessionState | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/session`);
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }

  /**
   * Delete the saved session file (called after restore or dismiss).
   */
  async clearSession(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/session`, {method: 'DELETE'});
    } catch {
      // Ignore
    }
  }
}

/**
 * Singleton API client instance.
 */
export const apiClient = new ApiClient();
