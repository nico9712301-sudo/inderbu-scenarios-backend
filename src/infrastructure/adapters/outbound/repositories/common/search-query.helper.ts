/**
 * Helper para consultas de búsqueda en MySQL con soporte para FULLTEXT y LIKE
 * Maneja la sanitización de términos y determinación de estrategias de búsqueda
 */
export class SearchQueryHelper {
  
  /**
   * Sanitiza un término de búsqueda para MySQL FULLTEXT BOOLEAN MODE
   * Filtra caracteres especiales y palabras problemáticas
   * @param term - Término de búsqueda a sanitizar
   * @returns Término sanitizado para usar con MATCH...AGAINST
   */
  static sanitizeSearchTerm(term: string): string {
    return term
      .split(/\s+/)
      .filter(word => 
        word.length > 1 && 
        !/^[-+*()~<>"]+$/.test(word) &&
        /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(word) // Al menos una letra
      )
      .map(word => `+${word.replace(/[+\-*()~<>"]/g, '')}*`)
      .join(' ');
  }

  /**
   * Determina si un término es pequeño y debe usar LIKE en lugar de FULLTEXT
   * @param term - Término a evaluar
   * @param threshold - Umbral de longitud (default: 4)
   * @returns true si debe usar LIKE, false si debe usar FULLTEXT
   */
  static shouldUseLikeSearch(term: string, threshold: number = 4): boolean {
    return term.trim().length < threshold;
  }

  /**
   * Genera patrones LIKE para búsqueda
   * @param term - Término de búsqueda
   * @returns Objeto con patrones para prefijo y contiene
   */
  static generateLikePatterns(term: string): { prefix: string; contains: string } {
    const cleanTerm = term.trim();
    return {
      prefix: `${cleanTerm}%`,
      contains: `%${cleanTerm}%`
    };
  }

  /**
   * Valida si un término sanitizado es válido para FULLTEXT
   * @param sanitizedTerm - Término ya sanitizado
   * @returns true si es válido para usar en FULLTEXT
   */
  static isValidForFulltext(sanitizedTerm: string): boolean {
    return sanitizedTerm.trim().length > 0;
  }
}
