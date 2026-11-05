import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../config/api';

function MaisVendidos() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarMaisVendidos = async () => {
      try {
        const opcoes = import.meta.env.DEV
          ? { baseURL: '/catalog-api' }
          : {};

        const resposta = await api.get('/produtos', opcoes);

        const lista = Array.isArray(resposta.data)
          ? resposta.data
          : [];

        const ordenados = [...lista].sort(
          (a, b) => Number(b.usos_pedidos || 0) -
                   Number(a.usos_pedidos || 0)
        );

        setProdutos(ordenados);
      } catch (erro) {
        console.error('Erro ao carregar mais vendidos:', erro);
      } finally {
        setCarregando(false);
      }
    };

    carregarMaisVendidos();
  }, []);

  return (
    <>
      <Navbar />

      <main className="voke-inicio">
        <section className="voke-inicio-destaques">
          <h1>Mais vendidos</h1>
          <p>Confira os produtos mais comprados na Voke Brasil.</p>

          {carregando ? (
            <p>Carregando produtos...</p>
          ) : produtos.length === 0 ? (
            <p>Nenhum produto encontrado.</p>
          ) : (
            <div className="voke-vitrina-grid">
              {produtos.slice(0, 8).map((produto) => (
                <article
                  key={produto.id}
                  className="voke-tarjeta-producto"
                >
                  <h3>{produto.nombre}</h3>

                  <p>
                    R$ {Number(produto.precio || 0).toLocaleString(
                      'pt-BR',
                      { minimumFractionDigits: 2 }
                    )}
                  </p>

                  <p>
                    Compras registradas: {produto.usos_pedidos || 0}
                  </p>

                  <Link to={`/produtos?buscar=${encodeURIComponent(
                    produto.nombre || ''
                  )}`}>
                    Ver produto
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

export default MaisVendidos;