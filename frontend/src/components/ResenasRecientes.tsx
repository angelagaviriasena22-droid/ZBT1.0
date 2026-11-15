import React, { useEffect, useState } from "react";
import { resenaService } from "../services/resenaService";
import type { ResenaPublica } from "../types/resena";

export const ResenasRecientes = () => {
  const [resenas, setResenas] = useState<ResenaPublica[]>([]);

  useEffect(() => {
    resenaService.recientes(6)
      .then((data) => {
        if (Array.isArray(data)) {
          setResenas(data);
        } else {
          setResenas([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setResenas([]);
      });
  }, []);

 return (
    <div>
      {Array.isArray(resenas) && resenas.map((resena: any) => (
        <div key={resena.id || resena.id_resena}>
          <p>{resena.comentario}</p>
        </div>
      ))}
    </div>
  );
};