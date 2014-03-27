{{#unpublished}}
## \{{blockquote}}

> Create a blockquote. Outputs a string with a given attribution as a quote.

Template:

```handlebars
\{{#blockquote '@doowb' 'http://github.com/source/for/your/quote' 'This is the title' }}
  This is your quote.
\{{/blockquote}}
```
Renders to:

```handlebars
<blockquote>
  <p>This is your quote.</p>
  <footer>
    <strong>@doowb</strong>
    <cite>
      <a href="http://github.com/source/for/your/quote">This is the title</a>
    </cite>
  </footer>
</blockquote>
```
{{/unpublished}}