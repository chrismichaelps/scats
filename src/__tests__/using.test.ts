import { describe, expect, it, vi } from 'vitest';
import { Using, Closeable } from '../using';
import { Try, Success } from '../Try';

describe('Using', () => {
  // Create a mock Closeable resource
  class MockResource implements Closeable {
    constructor(public value: string = 'resource') { }

    read(): string {
      return this.value;
    }

    close = vi.fn();
  }

  describe('resource method', () => {
    it('should handle a single resource correctly', () => {
      const resource = new MockResource();
      const result = Using.resource(resource, r => r.read() + '-processed');

      expect(result.isSuccess).toBe(true);
      expect(result.get()).toBe('resource-processed');
      expect(resource.close).toHaveBeenCalledTimes(1);
    });

    it('should close resource even when an exception is thrown', () => {
      const resource = new MockResource();

      const result = Using.resource(resource, () => {
        throw new Error('Test error');
      });

      expect(result.isFailure).toBe(true);
      expect(() => result.get()).toThrow('Test error');
      expect(resource.close).toHaveBeenCalledTimes(1);
    });

    it('should propagate exceptions from the resource processing', () => {
      const resource = new MockResource();

      const result = Using.resource(resource, () => {
        throw new Error('Processing error');
      });

      expect(result.isFailure).toBe(true);
      expect(() => result.get()).toThrow('Processing error');
      expect(resource.close).toHaveBeenCalledTimes(1);
    });
  });

  describe('resources method', () => {
    it('should handle multiple resources correctly', () => {
      const resource1 = new MockResource('first');
      const resource2 = new MockResource('second');

      const result = Using.resources([resource1, resource2], ([r1, r2]) => {
        return r1.read() + '-' + r2.read();
      });

      expect(result.isSuccess).toBe(true);
      expect(result.get()).toBe('first-second');
      expect(resource1.close).toHaveBeenCalledTimes(1);
      expect(resource2.close).toHaveBeenCalledTimes(1);
    });

    it('should close all resources even when an exception is thrown', () => {
      const resource1 = new MockResource();
      const resource2 = new MockResource();

      const result = Using.resources([resource1, resource2], () => {
        throw new Error('Test error');
      });

      expect(result.isFailure).toBe(true);
      expect(() => result.get()).toThrow('Test error');
      expect(resource1.close).toHaveBeenCalledTimes(1);
      expect(resource2.close).toHaveBeenCalledTimes(1);
    });

    it('should close resources in reverse order', () => {
      const closeOrder: number[] = [];

      class OrderedResource implements Closeable {
        constructor(private id: number) { }

        close(): void {
          closeOrder.push(this.id);
        }
      }

      const resource1 = new OrderedResource(1);
      const resource2 = new OrderedResource(2);
      const resource3 = new OrderedResource(3);

      Using.resources([resource1, resource2, resource3], () => 'result');

      // Should close in reverse order (3, 2, 1)
      expect(closeOrder).toEqual([3, 2, 1]);
    });
  });

  describe('resourceAsync method', () => {
    it('should handle async operations correctly', async () => {
      const resource = new MockResource();

      const result = await Using.resourceAsync(resource, async r => {
        return r.read() + '-async';
      });

      expect(result).toBe('resource-async');
      expect(resource.close).toHaveBeenCalledTimes(1);
    });

    it('should close resource even when a promise is rejected', async () => {
      const resource = new MockResource();

      await expect(
        Using.resourceAsync(resource, async () => {
          throw new Error('Async error');
        })
      ).rejects.toThrow('Async error');

      expect(resource.close).toHaveBeenCalledTimes(1);
    });
  });

  describe('manager method', () => {
    it('should provide a use pattern for resource management', () => {
      const resource = new MockResource();
      let acquiredResource: MockResource | null = null;

      const manager = Using.manager(
        () => {
          acquiredResource = resource;
          return resource;
        },
        (r) => {
          r.close();
        }
      );

      const result = manager.use(r => {
        expect(r).toBe(resource);
        return r.read() + '-managed';
      });

      expect(result).toBe('resource-managed');
      expect(acquiredResource).toBe(resource);
      expect(resource.close).toHaveBeenCalledTimes(1);
    });

    it('should handle async resource usage', async () => {
      const resource = new MockResource();

      const manager = Using.manager(
        () => resource,
        (r) => r.close()
      );

      const result = await manager.useAsync(async r => {
        return r.read() + '-async-managed';
      });

      expect(result).toBe('resource-async-managed');
      expect(resource.close).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    it('should handle errors when closing resources', () => {
      class FailingResource implements Closeable {
        close(): void {
          throw new Error('Close error');
        }
      }

      const resource = new FailingResource();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      // Should not throw despite close() throwing
      const result = Using.resource(resource, () => 'result');

      expect(result.isSuccess).toBe(true);
      expect(result.get()).toBe('result');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should prioritize user exceptions over close exceptions', () => {
      class FailingResource implements Closeable {
        close(): void {
          throw new Error('Close error');
        }
      }

      const resource = new FailingResource();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      // Should contain the user error, not the close error
      const result = Using.resource(resource, () => {
        throw new Error('User error');
      });

      expect(result.isFailure).toBe(true);
      expect(() => result.get()).toThrow('User error');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
}); 