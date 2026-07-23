// Compatibility shim for screens written against the NativeWind v2 `styled()` API.
// NativeWind v4 gives className support to core RN components automatically, but
// third-party components (e.g. SafeAreaView) need an explicit cssInterop registration.
// This wrapper does that registration once per component and returns it unchanged,
// so existing `const StyledX = styled(X)` call sites keep working as-is.
import { cssInterop } from 'nativewind';

const registered = new WeakSet<object>();

export function styled<T extends object>(Component: T): T {
  if (!registered.has(Component)) {
    cssInterop(Component as any, { className: 'style' });
    registered.add(Component);
  }
  return Component;
}
