// app/actions/register.ts
'use server';

import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";

export async function registrarUsuario(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;


  if (!email || !password) {
    return { error: "Todos os campos são obrigatórios." };
  }

  try {

    const usuarioExistente = await prisma.user.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      return { error: "Este e-mail já está em uso." };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword, // Salvando a senha protegida
      },
    });

    return { success: "Usuário cadastrado com sucesso!" };

  } catch (error) {
    return { error: "Ocorreu um erro ao criar a conta. Tente novamente." };
  }
}