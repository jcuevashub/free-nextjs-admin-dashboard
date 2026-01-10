"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import { signInAction } from "@/app/(full-width-pages)/(auth)/signin/actions";
import Link from "next/link";
import React, { useState, Suspense } from "react";
import SessionExpiredAlert from "@/components/auth/SessionExpiredAlert";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formAction = async (formData: FormData) => {
    const result = await signInAction(formData);
    if (result?.error) {
      setError(result.error);
    }
  };
  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Iniciar sesión
            </h1>
            <p className="text-md text-gray-500 dark:text-gray-400">
              Ingresa tu correo y contraseña para acceder.
            </p>
          </div>
          <Suspense fallback={null}>
            <SessionExpiredAlert />
          </Suspense>
          <div>
            <form action={formAction}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Correo electrónico <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    name="email"
                    placeholder="info@gmail.com"
                    type="email"
                    required
                  />
                </div>
                <div>
                  <Label>
                    Contraseña <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Introduce tu contraseña"
                      required
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Mantener sesión activa
                    </span>
                  </div>
                  <Link
                    href="/reset-password"
                    className="text-md text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div>
                  <Button className="w-full" size="sm">
                    Ingresar
                  </Button>
                </div>
              </div>
            </form>
            {error ? (
              <p className="mt-3 text-md text-error-500">{error}</p>
            ) : null}

            <div className="mt-5">
              <p className="text-md font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                ¿No tienes cuenta?{" "}
                <Link
                  href="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Crear cuenta
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
