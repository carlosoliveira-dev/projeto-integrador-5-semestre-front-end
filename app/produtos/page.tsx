export default function Product() {
  return (
    <>
    <header>
        <h1>Cadastro de Produtos</h1>
    </header>

    <form action="/pagina-processa-dados-do-form" method="post" encType="multipart/form-data">
    <div>
        <label htmlFor="nome_produto">Nome do Produto:</label>
        <input type="text" id="nome_produto" placeholder="Insira o nome do produto" required/>
    </div>
    <div>
        <label htmlFor="codigo_barras">Código de Barras:</label>
        <input type="number" id="codigo_barras" placeholder="Insira o código de barras"/>
    </div>
     <div>
        <label htmlFor="descricao">Descrição:</label>
        <textarea id="descricao" name="descricao" placeholder="Descreva brevemente o produto" required></textarea>
    </div>
    <div>
        <label htmlFor="estoque">Quantidade em Estoque:</label>
        <input type="number" id="estoque" placeholder="Quantidade disponível"/>
    </div>
    <div>
        <label htmlFor="categoria">Categoria:</label>
        <select id="categoria" name="categoria" required>
            <option value="Eletrônicos">Eletrônicos</option>
            <option value="Alimentos">Alimentos</option>
            <option value="Vestuário">Vestuário</option>
            <option value="Outro">Outro</option>
        </select>
    </div>
    <div>
        <label htmlFor="data_validade">Data de Validade:</label>
        <input type="date" id="data_validade" placeholder="Selecione a data de validade"/>
    </div>
    <div>
        <label htmlFor="foto">Imagem do Produto:</label>
        <input type="file" id="foto" name="foto" accept="image/*"/>
    </div>
    <div className="button">
        <button type="submit">Cadastrar Fornecedor</button>
    </div>
    </form>
    </>
  )
}
