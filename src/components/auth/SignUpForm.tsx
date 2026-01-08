"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import { signUpAction } from "@/app/(full-width-pages)/(auth)/signup/actions";
import Link from "next/link";
import React, { useState } from "react";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState(false);

  const formAction = async (formData: FormData) => {
    const result = await signUpAction(formData);
    if (result?.error) {
      setError(result.error);
      setSuccess(false);
    } else {
      setError(null);
      setSuccess(true);
    }
  };
  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Volver al panel
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Crear cuenta
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingresa tu correo y contraseña para registrarte.
            </p>
          </div>
          <div>
            <form action={formAction}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* <!-- First Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Nombre<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="fname"
                      name="fname"
                      placeholder="Ingresa tu nombre"
                      autoComplete="given-name"
                    />
                  </div>
                  {/* <!-- Last Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Apellido<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="lname"
                      name="lname"
                      placeholder="Ingresa tu apellido"
                      autoComplete="family-name"
                    />
                  </div>
                </div>
                {/* <!-- Email --> */}
                <div>
                  <Label>
                    Correo electrónico<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Ingresa tu correo"
                    required
                    autoComplete="email"
                  />
                </div>
                {/* <!-- Password --> */}
                <div>
                  <Label>
                    Contraseña<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Ingresa tu contraseña"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      autoComplete="new-password"
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
                {/* <!-- Checkbox --> */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    Al crear una cuenta aceptas los{" "}
                    <span className="text-gray-800 dark:text-white/90">
                      Términos y Condiciones,
                    </span>{" "}
                    and our{" "}
                    <span className="text-gray-800 dark:text-white">
                      Política de Privacidad
                    </span>
                  </p>
                </div>
                {/* <!-- Button --> */}
                <div>
                  <button className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
                    Crear cuenta
                  </button>
                </div>
              </div>
            </form>
            {error ? (
              <p className="mt-3 text-sm text-error-500">{error}</p>
            ) : null}
            {success ? (
              <p className="mt-3 text-sm text-success-600">
                Te enviamos un correo para confirmar tu cuenta. Revisa tu bandeja y vuelve para iniciar sesión.
              </p>
            ) : null}

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                ¿Ya tienes cuenta?
                <Link
                  href="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
