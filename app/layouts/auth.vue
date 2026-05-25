<template>
  <div class="min-h-screen w-full bg-slate-50 md:bg-gradient-to-br md:from-slate-50 md:to-primary-50/30 flex items-center justify-center p-0 md:p-8">
    <div class="w-full max-w-md bg-white min-h-screen md:min-h-0 md:rounded-3xl relative md:shadow-2xl md:border md:border-slate-100 flex flex-col overflow-hidden">
      <main class="flex-1 overflow-y-auto no-scrollbar relative">
        <slot />
      </main>
    </div>
  </div>
</template>

