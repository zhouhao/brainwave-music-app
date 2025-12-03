# Brainwave Music App - Claude Code Instructions

## Project Overview

**Brainwave Music App** is a focus-enhancing music web application that provides soundscapes and playlists to help users concentrate while working.

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 3
- **UI Components**: Radix UI primitives
- **Backend**: Supabase (authentication & data)
- **Audio**: HTML5 Audio API
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts

### Project Structure
```
src/
├── components/          # React components
│   ├── AuthModal.tsx   # Authentication UI
│   ├── BrainwaveApp.tsx # Main app component
│   ├── ErrorBoundary.tsx # Error handling
│   └── SessionLibrary.tsx # Session management
├── contexts/           # React Context providers
│   ├── AudioContext.tsx # Audio playback state
│   └── AuthContext.tsx  # Authentication state
├── hooks/              # Custom React hooks
│   ├── use-mobile.tsx
│   └── useBrainwaveSessions.ts
├── lib/                # Utilities and services
│   ├── supabase.ts     # Supabase client
│   └── utils.ts        # Helper functions
├── App.tsx             # App entry component
└── main.tsx            # App entry point

public/audio/           # Audio files (mp3, wav)
```

## Development Guidelines

### Architecture Principles

1. **Component Composition**
   - Use Radix UI primitives as building blocks
   - Prefer composition over complex prop drilling
   - Keep components focused and single-purpose

2. **State Management**
   - Use React Context for global state (Auth, Audio)
   - Custom hooks for business logic and data fetching
   - Local state for UI-only concerns

3. **Type Safety**
   - All components must have proper TypeScript types
   - Use Zod schemas for form validation and data validation
   - Avoid `any` types - use `unknown` when type is uncertain

4. **Styling**
   - Use Tailwind utility classes
   - Follow existing spacing and color conventions
   - Maintain dark mode compatibility
   - Use CSS variables for theme values

### Code Standards

#### Component Guidelines

```typescript
// ✅ Good: Functional component with proper typing
interface BrainwavePlayerProps {
  sessionId: string;
  onComplete?: () => void;
}

export function BrainwavePlayer({ sessionId, onComplete }: BrainwavePlayerProps) {
  // Implementation
}

// ❌ Bad: No types, unclear props
export function BrainwavePlayer(props) {
  // Implementation
}
```

#### Context Usage

- Use existing contexts (AudioContext, AuthContext) for shared state
- Create new context only when state is truly global
- Provide clear provider interfaces

#### Custom Hooks

- Prefix with `use` (e.g., `useBrainwaveSessions`)
- Encapsulate reusable logic and side effects
- Return clear, documented interfaces

### Audio Handling

- Audio files located in `public/audio/`
- Supported formats: MP3, WAV
- Use AudioContext for playback state management
- Handle loading, playing, pausing, and error states

### Authentication & Data

- Supabase client configured in `src/lib/supabase.ts`
- Use AuthContext for authentication state
- All Supabase operations should handle errors gracefully
- Session data stored and retrieved via Supabase

### Testing Strategy

**Current state**: No test framework configured

**When adding tests**:
- Use Vitest (Vite's test framework)
- Test business logic in hooks
- Test component behavior, not implementation
- Mock Supabase calls in tests

### Build & Development

#### Commands

```bash
# Development
pnpm dev              # Start dev server (installs deps automatically)

# Production
pnpm build            # Standard build
pnpm build:prod       # Production build with BUILD_MODE=prod

# Quality
pnpm lint             # Run ESLint
pnpm preview          # Preview production build

# Maintenance
pnpm install-deps     # Install dependencies
pnpm clean            # Clean node_modules and cache
```

#### Environment Variables

Create `.env.local` for local development:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Important**: Never commit `.env.local` or real credentials

### Performance Considerations

1. **Audio Optimization**
   - Lazy load audio files
   - Preload next track when possible
   - Handle memory cleanup on unmount

2. **Bundle Size**
   - Code-split routes if adding routing
   - Lazy load heavy components (charts, modals)
   - Tree-shake unused Radix UI components

3. **Rendering**
   - Memoize expensive computations
   - Use React.memo for pure components
   - Avoid unnecessary re-renders in audio playback

## Common Tasks

### Adding a New Audio Track

1. Add audio file to `public/audio/`
2. Update track metadata in appropriate component/context
3. Ensure file is accessible and plays correctly
4. Test on different browsers

### Adding a New Component

1. Create in `src/components/`
2. Follow existing TypeScript patterns
3. Use Radix UI primitives when applicable
4. Style with Tailwind classes
5. Export from component file

### Modifying Supabase Schema

1. Update schema in Supabase dashboard
2. Update TypeScript types to match
3. Update affected queries/mutations
4. Test authentication flow if auth-related

### Adding Form Validation

1. Create Zod schema for form data
2. Use React Hook Form with `@hookform/resolvers/zod`
3. Provide clear error messages
4. Test edge cases

## Design Patterns to Follow

### Error Boundaries

- Wrap components that might throw in ErrorBoundary
- Provide fallback UI for errors
- Log errors appropriately

### Loading States

- Show loading indicators for async operations
- Use Radix UI Progress component for deterministic progress
- Handle empty states gracefully

### Accessibility

- All interactive elements keyboard accessible
- Proper ARIA labels on custom controls
- Focus management in modals and dialogs
- Color contrast compliance

## Anti-Patterns to Avoid

❌ **Don't**:
- Mutate state directly
- Use `any` type
- Inline complex logic in JSX
- Create deep component hierarchies
- Store derived state
- Use `useEffect` for data transformation
- Add `!important` in CSS
- Hardcode colors/spacing (use Tailwind utilities)

✅ **Do**:
- Use immutable state updates
- Provide proper TypeScript types
- Extract complex logic to functions/hooks
- Keep component tree flat
- Derive state from source of truth
- Use `useMemo` for expensive computations
- Follow Tailwind design system
- Use CSS variables for theme values

## Debugging Tips

### Audio Issues
- Check browser console for audio errors
- Verify file paths in `public/audio/`
- Test in different browsers (Safari, Chrome, Firefox)
- Check autoplay policies

### State Issues
- Use React DevTools to inspect context values
- Check component re-render frequency
- Verify state updates are immutable

### Supabase Issues
- Verify environment variables are loaded
- Check network tab for API responses
- Review Supabase dashboard logs
- Ensure RLS policies are correct

## Deployment Notes

### Build Process
- Uses Vite for optimized production builds
- TypeScript compilation via `tsc -b`
- Clears Vite temp cache before build

### Environment Setup
- Configure production Supabase credentials
- Set appropriate CORS policies
- Configure CDN for audio files if needed

### Browser Support
- Modern browsers (ES2020+)
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Code Review Checklist

Before committing:
- [ ] TypeScript compilation passes (`pnpm build`)
- [ ] No ESLint errors (`pnpm lint`)
- [ ] Component types are properly defined
- [ ] No console errors in browser
- [ ] Audio playback works correctly
- [ ] Dark mode displays correctly
- [ ] Responsive on mobile and desktop
- [ ] Accessibility: keyboard navigation works
- [ ] Error states handled gracefully
- [ ] Loading states provide feedback

## Resources

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Notes for Claude Code

### When Making Changes
1. **Read before writing** - Always read existing code to understand patterns
2. **Incremental changes** - Make small, testable changes
3. **Type safety** - Ensure all changes maintain TypeScript type safety
4. **Test audio** - If touching audio code, verify playback works
5. **Preserve theme** - Maintain dark mode compatibility

### Common Patterns in This Codebase
- Context providers wrap components in `main.tsx`
- Custom hooks handle data fetching and business logic
- Radix UI components styled with Tailwind
- Zod schemas for validation
- Functional components with TypeScript interfaces

### Priority Order for Changes
1. **Type safety** - Fix TypeScript errors first
2. **Functionality** - Core features must work
3. **UX** - Loading/error states, feedback
4. **Performance** - Optimize if needed
5. **Polish** - Refinements and improvements
