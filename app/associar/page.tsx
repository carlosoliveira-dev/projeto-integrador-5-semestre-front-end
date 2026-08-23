export default function Association() {
  return (
    <>
    <header>
        <h1>Associação de Fornecedor a Produto</h1>
    </header>

    <form action="/pagina-processa-dados-do-form" method="post" encType="multipart/form-data">
    <div>
        <h2>Detalhes do Produto:</h2>
        <label htmlFor="nome_produto">Nome do Produto:</label>
        <input type="text" id="nome_produto" readOnly/>
    </div>
    <div>
        <label htmlFor="codigo_barras">Código de Barras:</label>
        <input type="number" id="codigo_barras" readOnly/>
    </div>
     <div>
        <label htmlFor="descricao">Descrição:</label>
        <textarea id="descricao" name="descricao" readOnly></textarea>
    </div>
    <p>Foto do Produto</p>
    <h2>Associação de Fornecedor:</h2>
    <div>
        <label htmlFor="fornecedores">Fornecedores:</label>
        <select id="fornecedores" name="fornecedores" defaultValue="" required>
            <option value="" hidden disabled>Selecione um fornecedor</option>
            <option value="Carrefour">Carrefour</option>
            <option value="Padaria do Marcos">Padaria do Marcos</option>
            <option value="Droga Raia">Droga Raia</option>
        </select>
    </div>
    <div className="button">
        <button type="submit">Associar Fornecedor</button>
    </div>
    </form>
    <h2>Fornecedores Associados:</h2>
    <table border={1}>
    <thead>
        <tr>
            <th>Nome do Fornecedor</th>
            <th>CNPJ</th>
            <th>Ações</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Carrefour</td>
            <td>81.898.328/0001-79</td>
            <td>
                <button>Desassociar</button>
            </td>
        </tr>
        <tr>
            <td>Padaria do Marcos</td>
            <td>06.430.776/0001-28</td>
            <td>
                <button>Desassociar</button>
            </td>
        </tr>
        <tr>
            <td>Droga Raia</td>
            <td>98.090.997/0001-12</td>
            <td>
                <button>Desassociar</button>
            </td>
        </tr>
    </tbody>
</table>
    </>
  )
}
