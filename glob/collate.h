#include "freebsd-compat.h"

/**
 * [reallocarray(3)](https://man7.org/linux/man-pages/man3/realloc.3.html) resizes
 * allocated memory on the heap.
 *
 * Equivalent to `realloc(__ptr, __item_count * __item_size)` but fails if the
 * multiplication overflows.
 *
 * Returns a pointer (which may be different from `__ptr`) to the resized
 * memory on success and returns a null pointer and sets `errno` on failure
 * (but see the notes for malloc()).
 */
#if __ANDROID_API__ >= 29
void* _Nullable reallocarray(void* _Nullable __ptr, size_t __item_count, size_t __item_size) __BIONIC_ALLOC_SIZE(2, 3) __INTRODUCED_IN(29);
#else
#include <errno.h>
static __inline void* _Nullable reallocarray(void* _Nullable __ptr, size_t __item_count, size_t __item_size) {
  size_t __new_size;
  if (__builtin_mul_overflow(__item_count, __item_size, &__new_size)) {
    errno = ENOMEM;
    return NULL;
  }
  return realloc(__ptr, __new_size);
}
#endif
