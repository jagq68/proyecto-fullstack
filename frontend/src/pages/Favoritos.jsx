import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const Favoritos = () => {
  const navigate = useNavigate();
  const [favoritos, setFavoritos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const removerFavorito = async (productoId) => {
    try {
      await api.delete(`/favoritos/${productoId}`);
      setFavoritos((lista) =>
        lista.filter((item) =>
          (item.producto_id || item.productoId || item.id) !== productoId
        )
      );
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      setErro('Não foi possível remover este favorito.');
    }
  };

  useEffect(() => {
    let ativo = true;

    if (!localStorage.getItem('voke_token')) {
      navigate('/login');
      return () => {
        ativo = false;
      };
    }

    const carregarFavoritos = async () => {
      try {
        const resposta = await api.get('/favoritos');
        const dados = Array.isArray(resposta.data)
          ? resposta.data
          : resposta.data.favoritos || [];

        if (ativo) setFavoritos(dados);
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
        if (ativo) setErro('Não foi possível carregar seus favoritos.');
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    carregarFavoritos();

    return () => {
      ativo = false;
    };
  }, [navigate]);

  if (carregando) return <p>Carregando seus favoritos...</p>;

  return (
    <main className="favoritos-page">
      <h1>Meus Favoritos ❤️</h1>

      {erro && <p role="alert">{erro}</p>}

      {favoritos.length === 0 ? (
        <section>
          <p>Você ainda não tem produtos favoritos.</p>
          <button onClick={() => navigate('/produtos')}>
            Explorar produtos
          </button>
        </section>
      ) : (
        <section>
          {favoritos.map((item) => {
            const produto = item.produto || item;
            const id = item.producto_id || item.productoId || produto.id;

            return (
              <article key={id}>
                <h2>{produto.nombre || produto.nome}</h2>
                <p>
                  {produto.precio || produto.preco
                    ? `R$ ${produto.precio || produto.preco}`
                    : ''}
                </p>
                <button onClick={() => removerFavorito(id)}>
                  Remover dos favoritos
                </button>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
};

export default Favoritos;