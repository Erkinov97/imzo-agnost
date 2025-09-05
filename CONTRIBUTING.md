# Contributing to E-IMZO Agnostic

Bu loyihaga hissa qo'shganingiz uchun rahmat! Quyidagi yo'riqnomalarni o'qing.

## 🚀 Development Setup

### Talablar

- Node.js 18.x yoki yuqori
- pnpm 10.15.0
- Git

### O'rnatish

```bash
# Repository ni clone qiling
git clone <repository-url>
cd imzo-agnost

# Dependencies o'rnating
pnpm install

# Development mode
pnpm run dev
```

## 📝 Code Style

### Linting va Formatting

```bash
# Linting
pnpm run lint        # Oxlint + ESLint
pnpm run lint:fix    # Auto-fix

# Formatting
pnpm run format      # Prettier format
pnpm run format:check # Check format

# Type checking
pnpm run type-check

# Barcha quality checks
pnpm run quality     # Check all
pnpm run quality:fix # Fix all
```

### Code Standards

- **TypeScript**: Barcha yangi kod TypeScript da yozilishi kerak
- **ESLint**: ESLint qoidalariga rioya qiling
- **Prettier**: Avtomatik formatting
- **Oxlint**: TypeScript uchun tez linting

## 🔄 Git Workflow

### Commit Messages

Conventional Commits formatidan foydalaning:

```bash
# Commitizen yordamida
pnpm run commit

# Yoki qo'lda
git commit -m "feat: add new plugin functionality"
```

### Commit Types

- `feat`: Yangi xususiyat
- `fix`: Bug fix
- `docs`: Hujjatlar o'zgarishi
- `style`: Code style (formatting, semicolons, etc)
- `refactor`: Code refactoring
- `perf`: Performance yaxshilash
- `test`: Test qo'shish yoki o'zgartirish
- `build`: Build system o'zgarishi
- `ci`: CI konfiguratsiya o'zgarishi
- `chore`: Boshqa o'zgarishlar

### Branch Strategy

1. `main` - Production-ready kod
2. `develop` - Development branch
3. `feature/feature-name` - Yangi xususiyatlar
4. `fix/bug-description` - Bug fixlar
5. `docs/documentation-update` - Hujjatlar

### Pull Request Process

1. Feature branch yarating
2. O'zgarishlar kiriting
3. Testlar yozing
4. Quality checks o'tkazing
5. PR yarating
6. Code review kutiladi

## 🧪 Testing

```bash
# Testlar (hozircha mavjud emas)
pnpm run test

# Build test
pnpm run build

# Type check
pnpm run type-check
```

## 📋 Pre-commit Hooks

Husky avtomatik ravishda quyidagilarni tekshiradi:

- Type checking
- Linting (Oxlint + ESLint)
- Formatting (Prettier)
- Commit message format

## 🏗️ Plugin Development

### Yangi Plugin Yaratish

```typescript
import { EIMZOPlugin, RegisterPlugin } from './core/plugin-base';

@RegisterPlugin
export class MyPlugin extends EIMZOPlugin {
  readonly name = 'my-plugin';
  readonly description = 'My custom plugin';

  // Callback method
  myMethod = (
    param: string,
    onSuccess: CallbackFunction<MyResponse>,
    onError: ErrorCallback
  ): void => {
    this.callMethod('my_method', [param], onSuccess, onError);
  };

  // Promise method
  myMethodAsync = this.createPromiseMethod<[string], MyResponse>('my_method');
}
```

### Plugin Guidelines

1. **Naming**: Descriptive va unique nomlar
2. **Types**: To'liq TypeScript tiplar
3. **Documentation**: JSDoc commentlar
4. **Testing**: Unit testlar yozing
5. **Examples**: EXAMPLES.md ga qo'shing

## 📚 Documentation

### JSDoc

````typescript
/**
 * Sertifikatlarni yuklash
 * @param disk - Disk nomi
 * @param path - Fayl yo'li
 * @returns Promise sertifikatlar bilan
 * @example
 * ```typescript
 * const certs = await loadCertificates('C:', '/path/to/certs');
 * console.log(certs);
 * ```
 */
async loadCertificates(disk: string, path: string): Promise<Certificate[]> {
  // implementation
}
````

### README Updates

- Yangi pluginlar uchun README ni yangilang
- API o'zgarishlari uchun documentation yangilang
- Breaking changes ni CHANGELOG da belgilang

## 🔍 Code Review

### Review Criteria

- [ ] Code style ga mos
- [ ] Type safety
- [ ] Performance considerations
- [ ] Documentation mavjud
- [ ] Tests written
- [ ] No breaking changes (yoki documented)

### Review Process

1. Avtomatik checks o'tishi kerak
2. Kamida 1 mantainer approval
3. No unresolved discussions
4. Up-to-date with base branch

## 📦 Release Process

### Versioning

Semantic Versioning (SemVer) ishlatamiz:

- `MAJOR.MINOR.PATCH`
- `1.0.0` → `1.0.1` (patch: bug fixes)
- `1.0.0` → `1.1.0` (minor: new features)
- `1.0.0` → `2.0.0` (major: breaking changes)

### Release Steps

1. Version bump in package.json
2. Update CHANGELOG.md
3. Create git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. GitHub Actions avtomatik publish qiladi

## 🤝 Community

### Communication

- Issues: Bug reports va feature requests
- Discussions: Savollar va general discussion
- Pull Requests: Code contributions

### Help

- EXAMPLES.md - Comprehensive examples
- README.md - Quick start guide
- TypeScript intellisense - API documentation

## ⚠️ Important Notes

1. **Breaking Changes**: Major version bump kerak
2. **Security**: Sensitive ma'lumotlarni commit qilmang
3. **Dependencies**: Yangi dependency qo'shishdan oldin muhokama qiling
4. **Performance**: Large file o'zgarishlardan saqlaning

---

Hissa qo'shganingiz uchun rahmat! 🎉
